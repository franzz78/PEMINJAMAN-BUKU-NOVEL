let dbPeminjaman = JSON.parse(localStorage.getItem('perpus_data')) || [];

// ==========================================================================
// 1. FUNGSI NAVIGASI PANEL (Sesuai ID HTML asli kamu)
// ==========================================================================
function switchPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    
    const targetPanel = document.getElementById(id);
    if (targetPanel) {
        targetPanel.classList.add('active');
    }

    const container = document.getElementById('main-container');

    // Jika kembali ke panel awal atau absen, pastikan tampilan container kembali normal
    if (id !== 'panel-pengelola') {
        if (container) container.style.maxWidth = '480px';
    }
}

// ==========================================================================
// 2. FUNGSI HITUNG BATAS PENGEMBALIAN BUKU
// ==========================================================================
function hitungBatasKembali() {
    const tgl = document.getElementById('tgl-pinjam').value;
    if (tgl) {
        const d = new Date(tgl);
        d.setDate(d.getDate() + 4); // Batas pinjam 4 hari sesuai logika awalmu
        document.getElementById('tgl-batas').value = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
}

// ==========================================================================
// 3. FUNGSI LOGIN ADMIN & PEMBUATAN MENU DASHBOARD OTOMATIS
// ==========================================================================
function loginUmum() {
    const passInput = document.getElementById('admin-pass').value;

    if (!passInput) {
        Swal.fire('Perhatian', 'Silakan masukkan password terlebih dahulu.', 'warning');
        return;
    }

    // SILAKAN GANTI PASSWORD DI SINI
    if (passInput === 'SMANSALAPERPUS2026##') {
        Swal.fire('Berhasil', 'Selamat datang Admin SMANSALA', 'success');
        
        const panelPengelola = document.getElementById('panel-pengelola');
        const container = document.getElementById('main-container');
        
        // Perlebar ukuran container aplikasi agar tabel data muat dan rapi
        if (container) container.style.maxWidth = '700px';

        // JAVASCRIPT LOGIC: Mengubah isi halaman login menjadi Menu Dashboard Admin khusus
        panelPengelola.innerHTML = `
            <h2 class="panel-title" style="font-size: 22px; margin-bottom: 5px; text-align: center;">Dashboard Admin</h2>
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 20px; text-align: center;">Data Pengajuan Peminjaman Buku E-Library</p>
            
            <!-- Tombol Aksi Kendali Admin -->
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <button class="btn-primary" onclick="exportKeExcel()" style="margin-bottom: 0; padding: 10px; font-size: 12px; background: #10b981; flex: 1;">EXPORT EXCEL</button>
                <button class="btn-secondary" onclick="hapusSemuaData()" style="padding: 10px; font-size: 12px; border-color: #ef4444; color: #ef4444; flex: 1;">RESET DATA</button>
            </div>

            <!-- Tabel Data Antrean -->
            <div style="overflow-x: auto; background: rgba(15, 23, 42, 0.5); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background: rgba(37, 99, 235, 0.2); color: #60a5fa;">
                            <th style="padding: 12px 10px; color: #60a5fa;">Siswa</th>
                            <th style="padding: 12px 10px; color: #60a5fa;">Buku</th>
                            <th style="padding: 12px 10px; color: #60a5fa;">Batas</th>
                            <th style="padding: 12px 10px; color: #60a5fa;">Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="list-data">
                        <!-- Data pinjaman otomatis di-render di sini -->
                    </tbody>
                </table>
            </div>

            <button class="btn-text" onclick="location.reload()" style="color: #ef4444; font-weight: bold;">LOGOUT / KELUAR</button>
        `;
        
        // Tampilkan data ke dalam tabel yang baru dibuat
        renderAdminData();
    } else {
        Swal.fire('Gagal', 'Password Administrator Salah!', 'error');
    }
}

// ==========================================================================
// 4. FUNGSI KIRIM PENGAJUAN PINJAM (Sesuai ID Form HTML asli kamu)
// ==========================================================================
function mintaPersetujuan() {
    const kelas = document.getElementById('kelas').value;
    const nama = document.getElementById('nama-siswa').value.trim();
    const buku = document.getElementById('judul-buku').value.trim();
    const tglBatas = document.getElementById('tgl-batas').value;

    if (!nama || !kelas || !buku || !tglBatas) {
        return Swal.fire('Data Tidak Lengkap', 'Silakan isi semua kolom formulir.', 'warning');
    }

    dbPeminjaman.push({
        id: Date.now(),
        nama,
        kelas,
        buku,
        tglBatas,
        status: 'Menunggu'
    });

    localStorage.setItem('perpus_data', JSON.stringify(dbPeminjaman));

    Swal.fire({
        title: 'Terkirim!',
        text: 'Silakan verifikasi ke petugas perpustakaan.',
        icon: 'success',
        confirmButtonColor: '#2563eb'
    }).then(() => {
        // Reset isi form setelah data disimpan
        document.getElementById('nama-siswa').value = '';
        document.getElementById('judul-buku').value = '';
        document.getElementById('kelas').value = '';
        document.getElementById('tgl-batas').value = '';
        switchPanel('panel-awal');
    });
}

// ==========================================================================
// 5. RENDER DAFTAR TABEL DI DASHBOARD ADMIN
// ==========================================================================
function renderAdminData() {
    const list = document.getElementById('list-data');
    if (!list) return;

    if (dbPeminjaman.length === 0) {
        list.innerHTML = '<tr><td colspan="4" align="center" style="padding: 20px; color: #64748b;">Tidak ada antrean pengajuan</td></tr>';
        return;
    }

    list.innerHTML = dbPeminjaman.map((d, i) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">   
            <td style="padding: 10px;"><b>${d.nama}</b><br><span style="font-size:11px; color:#94a3b8;">${d.kelas}</span></td>   
            <td style="padding: 10px;">${d.buku}</td>   
            <td style="padding: 10px; font-size:11px;">${d.tglBatas}</td>   
            <td style="padding: 10px;">   
                ${d.status === 'Menunggu' ? `
                    <button style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:bold;" onclick="prosesPersetujuan(${i}, 'Diterima')">Terima</button>
                    <button style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:bold;" onclick="prosesPersetujuan(${i}, 'Ditolak')">Tolak</button>
                ` : `
                    <span style="color:#10b981; font-weight:bold; font-size:11px; display:block; margin-bottom:4px;">✓ Diterima</span>
                    <button style="background:none; border:1px solid #64748b; color:#94a3b8; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:10px;" onclick="hapusData(${i})">Hapus</button>
                `}   
            </td>   
        </tr>
    `).join('');
}

// ==========================================================================
// 6. PROSES SETUJU / TOLAK OLEH ADMIN
// ==========================================================================
function prosesPersetujuan(index, aksi) {
    if (aksi === 'Diterima') {
        dbPeminjaman[index].status = 'Diterima';
        Swal.fire('Disetujui', 'Peminjaman buku resmi dicatat.', 'success');
    } else {
        dbPeminjaman.splice(index, 1);
        Swal.fire('Ditolak', 'Pengajuan telah dihapus.', 'error');
    }
    localStorage.setItem('perpus_data', JSON.stringify(dbPeminjaman));
    renderAdminData();
}

// ==========================================================================
// 7. HAPUS DATA SATUAN DAN MASSAL
// ==========================================================================
function hapusData(i) {
    dbPeminjaman.splice(i, 1);
    localStorage.setItem('perpus_data', JSON.stringify(dbPeminjaman));
    renderAdminData();
}

function hapusAllDataAdmin() {
    dbPeminjaman = [];
    localStorage.removeItem('perpus_data');
    renderAdminData();
}

function hapusSemuaData() {
    Swal.fire({ 
        title: 'Hapus Semua Data?', 
        text: 'Data yang terhapus tidak bisa dikembalikan!',
        icon: 'warning', 
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b'
    }).then((res) => {
        if (res.isConfirmed) { 
            hapusAllDataAdmin();
            Swal.fire('Terhapus!', 'Semua data telah dibersihkan.', 'success');
        }
    });
}

// ==========================================================================
// 8. EXPORT REKAP KE EXCEL (.CSV)
// ==========================================================================
function exportKeExcel() {
    if (dbPeminjaman.length === 0) {
        Swal.fire('Kosong', 'Tidak ada data untuk diexport.', 'info');
        return;
    }
    
    let csv = "Nama,Kelas,Buku,Batas Kembali,Status\n" +
              dbPeminjaman.map(d => `"${d.nama}","${d.kelas}","${d.buku}","${d.tglBatas}","${d.status}"`).join("\n");
              
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'rekap_eperpus_la.csv';
    a.click();
}
