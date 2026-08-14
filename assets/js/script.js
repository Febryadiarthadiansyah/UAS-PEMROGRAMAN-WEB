document.addEventListener('DOMContentLoaded', function() {
    
    // ==========================================
    // 1. NAVIGASI & TEMA (Auto Active & Dark Mode)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Load Tema
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if(themeToggle) themeToggle.textContent = '☀️';
    }

    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                themeToggle.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                themeToggle.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }

    // Hamburger Logic
    if(hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Auto Active Nav Link berdasarkan URL
    const currentPath = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // ==========================================
    // 2. FORM PENDAFTARAN (Validasi Inline & Simpan)
    // ==========================================
    const formDaftar = document.getElementById('form-daftar');
    
    if (formDaftar) {
        formDaftar.addEventListener('submit', function(e) {
            e.preventDefault();

            const nama = document.getElementById('nama').value.trim();
            const nim = document.getElementById('nim').value.trim();
            const tglLahir = document.getElementById('tglLahir').value;
            const email = document.getElementById('email').value.trim();
            const jkRadio = document.querySelector('input[name="jenis_kelamin"]:checked');
            const kelas = document.getElementById('kelas').value;

            clearErrors();
            let isValid = true;

            if (!nama) { showError('nama', 'error-nama'); isValid = false; }
            if (!nim || !/^\d{1,10}$/.test(nim)) { showError('nim', 'error-nim'); isValid = false; }
            if (!tglLahir) { showError('tglLahir', 'error-tglLahir'); isValid = false; }
            
            const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
            if (!email || !email.match(emailPattern)) { showError('email', 'error-email'); isValid = false; }
            
            if (!jkRadio) { document.getElementById('error-jk').style.display = 'block'; isValid = false; }
            if (!kelas) { showError('kelas', 'error-kelas'); isValid = false; }

            if (!isValid) return;

            // Hitung Umur
            const tahunLahir = new Date(tglLahir).getFullYear();
            const tahunIni = new Date().getFullYear();
            const umur = tahunIni - tahunLahir;

            // Simpan Database LocalStorage
            let dataPeserta = JSON.parse(localStorage.getItem('dataPeserta')) || [];
            const pesertaBaru = {
                id: Date.now(),
                nama, nim, umur, email, 
                jenisKelamin: jkRadio.value, 
                kelas
            };

            dataPeserta.push(pesertaBaru);
            localStorage.setItem('dataPeserta', JSON.stringify(dataPeserta));

            alert('Pendaftaran berhasil!');
            window.location.href = 'peserta.html';
        });
    }

    function showError(inputId, errorId) {
        document.getElementById(inputId).classList.add('error-border');
        document.getElementById(errorId).style.display = 'block';
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(e => e.style.display = 'none');
        document.querySelectorAll('.error-border').forEach(i => i.classList.remove('error-border'));
    }

    // ==========================================
    // 3. TABEL PESERTA & STATISTIK (CRUD Logic)
    // ==========================================
    const tabelBody = document.getElementById('tabel-peserta-body');

    if (tabelBody) {
        let dataPeserta = JSON.parse(localStorage.getItem('dataPeserta')) || [];
        
        // Update Statistik
        let totalLaki = dataPeserta.filter(p => p.jenisKelamin === 'Laki-laki').length;
        let totalPerempuan = dataPeserta.filter(p => p.jenisKelamin === 'Perempuan').length;
        
        document.getElementById('stat-total').textContent = dataPeserta.length;
        document.getElementById('stat-laki').textContent = totalLaki;
        document.getElementById('stat-perempuan').textContent = totalPerempuan;

        // Render Tabel
        if (dataPeserta.length === 0) {
            tabelBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">Belum ada peserta terdaftar.</td></tr>`;
        } else {
            let no = 1;
            dataPeserta.forEach(function(peserta) {
                const row = `
                    <tr>
                        <td>${no++}</td>
                        <td>${peserta.nama}</td>
                        <td>${peserta.nim}</td>
                        <td>${peserta.umur} Tahun</td>
                        <td>${peserta.jenisKelamin}</td>
                        <td>${peserta.kelas}</td>
                        <td><button class="btn-delete" onclick="hapusPeserta(${peserta.id})">Hapus</button></td>
                    </tr>
                `;
                tabelBody.innerHTML += row;
            });
        }
    }

    // Fungsi Hapus Global
    window.hapusPeserta = function(id) {
        if (confirm('Yakin ingin menghapus data ini?')) {
            let dataPeserta = JSON.parse(localStorage.getItem('dataPeserta')) || [];
            dataPeserta = dataPeserta.filter(peserta => peserta.id !== id);
            localStorage.setItem('dataPeserta', JSON.stringify(dataPeserta));
            window.location.reload();
        }
    }

    // ==========================================
    // 4. KUIS INTERAKTIF (Algoritma Skor)
    // ==========================================
    const formKuis = document.getElementById('form-kuis');

    if (formKuis) {
        const kunciJawaban = ['a', 'a', 'c', 'b', 'd'];

        formKuis.addEventListener('submit', function(e) {
            e.preventDefault();
            let skor = 0;
            
            for (let i = 1; i <= 5; i++) {
                const jawabanUser = document.querySelector(`input[name="soal${i}"]:checked`);
                if (jawabanUser && jawabanUser.value === kunciJawaban[i-1]) {
                    skor++;
                }
            }

            const nilai = (skor / 5) * 100;
            const hasilDiv = document.getElementById('hasil-kuis');
            const teksNilai = document.getElementById('teks-nilai');
            const teksFeedback = document.getElementById('teks-feedback');

            formKuis.style.display = 'none';
            hasilDiv.style.display = 'block';
            teksNilai.textContent = `Nilai Anda: ${nilai}`;

            if (nilai >= 75) {
                hasilDiv.className = 'nilai-lulus';
                teksFeedback.textContent = 'Selamat! Anda LULUS. Pemahaman Anda sangat baik.';
            } else {
                hasilDiv.className = 'nilai-gagal';
                teksFeedback.textContent = 'BELUM LULUS. Silakan ulangi materi kembali.';
            }
        });

        const btnRetry = document.getElementById('btn-retry');
        if(btnRetry) {
            btnRetry.addEventListener('click', function() {
                formKuis.reset();
                formKuis.style.display = 'block';
                document.getElementById('hasil-kuis').style.display = 'none';
            });
        }
    }
});