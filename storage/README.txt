Debian File Repository (Auto-Discovery)
=====================================
Repositori ini digunakan untuk menyimpan dan mendistribusikan file:
- PNG (.png)  : Tangkapan layar, diagram, gambar aset
- TXT (.txt)  : Catatan, dokumentasi, konfigurasi, log
- ISO (.iso)  : Image instalasi OS / live image
- OVA (.ova)  : Virtual appliance (VirtualBox, VMware, Proxmox)

Fitur:
1. Auto-discovery: Setiap file & folder yang ditambahkan langsung terbaca seketika.
2. Tampilan: Bergaya Debian mirror (lengkap dengan mode Klasik / Modern).
3. Upload: Drag & drop di browser atau via curl -T file.ext http://localhost:3000/path/
4. Resumable: Dukungan HTTP Range (206) untuk file besar seperti ISO dan OVA.
