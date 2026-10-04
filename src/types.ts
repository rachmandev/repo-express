export interface RepoItem {
  name: string;
  relPath: string; // URL path relative to storage root, e.g. "/images/screenshot.png"
  fullPath: string;
  isDirectory: boolean;
  size: number;
  formattedSize: string;
  mtime: Date;
  mtimeFormatted: string;
  ext: string;
  icon: 'dir' | 'image' | 'video' | 'doc' | 'pdf' | 'text' | 'iso' | 'dmg' | 'ova' | 'archive' | 'file';
  mimeType: string;
}

export interface Breadcrumb {
  name: string;
  path: string;
}

export interface DirectoryListing {
  currentPath: string;
  parentPath: string | null;
  breadcrumbs: Breadcrumb[];
  items: RepoItem[];
  totalDirs: number;
  totalFiles: number;
  totalSize: number;
  formattedTotalSize: string;
}
