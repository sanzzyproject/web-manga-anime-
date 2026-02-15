const API_BASE = '/api'; // Relative path karena satu domain di Vercel

async function loadTopAnime() {
    showLoading(true);
    document.getElementById('sectionTitle').innerText = 'Peringkat Teratas (Top Anime)';
    
    try {
        const res = await fetch(`${API_BASE}/top`);
        const json = await res.json();
        
        if (json.success) {
            renderCards(json.data);
        } else {
            alert('Gagal memuat data: ' + json.message);
        }
    } catch (error) {
        console.error(error);
        alert('Terjadi kesalahan koneksi');
    } finally {
        showLoading(false);
    }
}

async function performSearch() {
    const query = document.getElementById('searchInput').value;
    if (!query) return;

    showLoading(true);
    document.getElementById('sectionTitle').innerText = `Hasil Pencarian: "${query}"`;

    try {
        const res = await fetch(`${API_BASE}/search?q=${query}`);
        const json = await res.json();

        if (json.success) {
            renderCards(json.data);
        } else {
            renderEmptyState();
        }
    } catch (error) {
        console.error(error);
    } finally {
        showLoading(false);
    }
}

function renderCards(data) {
    const grid = document.getElementById('animeGrid');
    grid.innerHTML = '';

    data.forEach(anime => {
        // Fallback image jika cover kosong
        const image = anime.cover || 'https://via.placeholder.com/200x300?text=No+Image';
        
        const card = `
            <div class="card" onclick="window.open('${anime.url}', '_blank')">
                <div class="card-img-wrapper">
                    <img src="${image}" alt="${anime.title}" loading="lazy">
                    ${anime.score ? `<div class="score-badge"><i class="fas fa-star"></i> ${anime.score}</div>` : ''}
                </div>
                <div class="card-info">
                    <div class="card-title">${anime.title}</div>
                    <div class="card-meta">
                        <span>${anime.type || 'Anime'}</span>
                        <span>${anime.rank ? '#' + anime.rank : ''}</span>
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

function showLoading(isLoading) {
    const loader = document.getElementById('loading');
    const grid = document.getElementById('animeGrid');
    
    if (isLoading) {
        loader.classList.remove('hidden');
        grid.innerHTML = '';
    } else {
        loader.classList.add('hidden');
    }
}

function renderEmptyState() {
    document.getElementById('animeGrid').innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Tidak ditemukan hasil.</p>';
}

// Load default saat web dibuka
document.addEventListener('DOMContentLoaded', () => {
    loadTopAnime();
});

// Enter key untuk search
document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        performSearch();
    }
});
