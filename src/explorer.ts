import fs from 'node:fs';
import path from 'node:path';
import type { DirectoryListing, RepoItem, Breadcrumb } from './types.ts';

export interface StorageStats {
  totalDirs: number;
  totalFiles: number;
  totalSize: number;
  formattedTotalSize: string;
  baseDir: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  formattedSize?: string;
  mtime?: string;
  children?: TreeNode[];
}

/** Allowed file extensions for upload */
export const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.mp4',
  '.mkv',
  '.pdf',
  '.txt',
  '.doc',
  '.docx',
  '.iso',
  '.img',
  '.dmg',
  '.ova',
  '.zip',
  '.rar',
]);

export class FileExplorer {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  /**
   * Check if a filename has an allowed extension.
   */
  public isAllowedFile(filename: string): boolean {
    const ext = path.extname(filename).toLowerCase();
    return ALLOWED_EXTENSIONS.has(ext);
  }

  /**
   * Safely resolves a request URL path to an absolute filesystem path.
   * Protects against directory traversal attacks.
   */
  public resolveSafePath(requestPath: string): { fullPath: string; isSafe: boolean; relPath: string } {
    let decoded: string;
    try {
      decoded = decodeURIComponent(requestPath);
    } catch {
      decoded = requestPath;
    }

    const cleanRelPath = path.posix.normalize('/' + decoded.replace(/^(\.\.[\/\\])+/, ''));
    const fullPath = path.resolve(this.baseDir, '.' + cleanRelPath);

    // Security check: ensure target is strictly inside or equal to baseDir
    const isSafe = fullPath === this.baseDir || fullPath.startsWith(this.baseDir + path.sep);

    return { fullPath, isSafe, relPath: cleanRelPath };
  }

  /**
   * Discovers and lists directory contents or checks file metadata.
   */
  public async discover(requestPath: string, sortKey = 'name', sortOrder = 'asc'): Promise<
    | { type: 'directory'; listing: DirectoryListing }
    | { type: 'file'; fullPath: string; item: RepoItem }
    | { type: 'not_found' }
    | { type: 'forbidden' }
  > {
    const { fullPath, isSafe, relPath } = this.resolveSafePath(requestPath);

    if (!isSafe) {
      return { type: 'forbidden' };
    }

    try {
      const stats = await fs.promises.stat(fullPath);

      if (stats.isFile()) {
        const item = this.buildItem(path.basename(fullPath), relPath, fullPath, stats);
        return { type: 'file', fullPath, item };
      }

      if (stats.isDirectory()) {
        const listing = await this.readDirectory(fullPath, relPath, sortKey, sortOrder);
        return { type: 'directory', listing };
      }

      return { type: 'not_found' };
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        return { type: 'not_found' };
      }
      throw err;
    }
  }

  private async readDirectory(
    fullPath: string,
    relPath: string,
    sortKey = 'name',
    sortOrder = 'asc'
  ): Promise<DirectoryListing> {
    const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });

    const items: RepoItem[] = [];
    let totalSize = 0;
    let totalDirs = 0;
    let totalFiles = 0;

    for (const entry of entries) {
      // Ignore hidden files / directories (e.g. .git, .DS_Store)
      if (entry.name.startsWith('.')) {
        continue;
      }

      const entryFullPath = path.join(fullPath, entry.name);
      const entryRelPath = path.posix.join(relPath === '/' ? '/' : relPath, entry.name);

      try {
        const stats = await fs.promises.stat(entryFullPath);
        const item = this.buildItem(entry.name, entryRelPath, entryFullPath, stats);

        if (item.isDirectory) {
          totalDirs++;
        } else {
          totalFiles++;
          totalSize += item.size;
        }

        items.push(item);
      } catch {
        // Skip inaccessible items or broken symlinks
      }
    }

    // Sort items: Directories always first, then sorted by sortKey
    items.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let comparison = 0;
      switch (sortKey) {
        case 'date':
          comparison = a.mtime.getTime() - b.mtime.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const parentPath = relPath === '/' ? null : path.posix.dirname(relPath);
    const breadcrumbs = this.generateBreadcrumbs(relPath);

    return {
      currentPath: relPath,
      parentPath: parentPath === '.' ? '/' : parentPath,
      breadcrumbs,
      items,
      totalDirs,
      totalFiles,
      totalSize,
      formattedTotalSize: this.formatBytes(totalSize),
    };
  }

  public async getRecursiveTree(dirPath = this.baseDir, relPrefix = '/'): Promise<TreeNode> {
    const dirName = path.basename(dirPath) || 'storage';
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
    const children: TreeNode[] = [];

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;

      const fullChild = path.join(dirPath, entry.name);
      const childRel = path.posix.join(relPrefix, entry.name);

      try {
        const stats = await fs.promises.stat(fullChild);
        if (stats.isDirectory()) {
          const subTree = await this.getRecursiveTree(fullChild, childRel);
          children.push(subTree);
        } else {
          children.push({
            name: entry.name,
            path: childRel,
            type: 'file',
            size: stats.size,
            formattedSize: this.formatBytes(stats.size),
            mtime: this.formatDate(stats.mtime),
          });
        }
      } catch {
        // ignore
      }
    }

    return {
      name: dirName,
      path: relPrefix,
      type: 'directory',
      children,
    };
  }

  public async getOverallStats(): Promise<StorageStats> {
    let totalDirs = 0;
    let totalFiles = 0;
    let totalSize = 0;

    const walk = async (currentDir: string) => {
      try {
        const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const full = path.join(currentDir, entry.name);
          try {
            const stats = await fs.promises.stat(full);
            if (stats.isDirectory()) {
              totalDirs++;
              await walk(full);
            } else if (stats.isFile()) {
              totalFiles++;
              totalSize += stats.size;
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // ignore
      }
    };

    await walk(this.baseDir);

    return {
      totalDirs,
      totalFiles,
      totalSize,
      formattedTotalSize: this.formatBytes(totalSize),
      baseDir: this.baseDir,
    };
  }

  private buildItem(name: string, relPath: string, fullPath: string, stats: fs.Stats): RepoItem {
    const isDirectory = stats.isDirectory();
    const ext = isDirectory ? '' : path.extname(name).toLowerCase();
    const icon = this.detectIcon(ext, isDirectory);
    const mimeType = this.detectMime(ext, isDirectory);

    return {
      name: isDirectory ? name + '/' : name,
      relPath: isDirectory && !relPath.endsWith('/') ? relPath + '/' : relPath,
      fullPath,
      isDirectory,
      size: isDirectory ? 0 : stats.size,
      formattedSize: isDirectory ? '-' : this.formatBytes(stats.size),
      mtime: stats.mtime,
      mtimeFormatted: this.formatDate(stats.mtime),
      ext,
      icon,
      mimeType,
    };
  }

  private detectIcon(ext: string, isDirectory: boolean): RepoItem['icon'] {
    if (isDirectory) return 'dir';
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return 'image';
    if (['.mp4', '.mkv'].includes(ext)) return 'video';
    if (ext === '.pdf') return 'pdf';
    if (['.doc', '.docx'].includes(ext)) return 'doc';
    if (ext === '.txt') return 'text';
    if (['.iso', '.img'].includes(ext)) return 'iso';
    if (ext === '.dmg') return 'dmg';
    if (ext === '.ova') return 'ova';
    if (['.zip', '.rar'].includes(ext)) return 'archive';
    return 'file';
  }

  public detectMime(ext: string, isDirectory: boolean): string {
    if (isDirectory) return 'inode/directory';

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.webp':
        return 'image/webp';
      case '.mp4':
        return 'video/mp4';
      case '.mkv':
        return 'video/x-matroska';
      case '.pdf':
        return 'application/pdf';
      case '.txt':
        return 'text/plain; charset=utf-8';
      case '.doc':
        return 'application/msword';
      case '.docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case '.iso':
        return 'application/x-iso9660-image';
      case '.img':
        return 'application/octet-stream';
      case '.dmg':
        return 'application/x-apple-diskimage';
      case '.ova':
        return 'application/x-virtualbox-ova';
      case '.zip':
        return 'application/zip';
      case '.rar':
        return 'application/vnd.rar';
      default:
        return 'application/octet-stream';
    }
  }

  private generateBreadcrumbs(relPath: string): Breadcrumb[] {
    const parts = relPath.split('/').filter(Boolean);
    const breadcrumbs: Breadcrumb[] = [{ name: '[Root]', path: '/' }];

    let current = '';
    for (const part of parts) {
      current += '/' + part;
      breadcrumbs.push({ name: part, path: current });
    }

    return breadcrumbs;
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${value >= 10 || i === 0 ? value.toFixed(0) : value.toFixed(1)} ${sizes[i]}`;
  }

  public formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }
}
