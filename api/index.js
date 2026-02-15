const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../public')));

// --- SCRAPER FUNCTIONS ---

// 1. Top Anime (Kode Asli Kamu + Penyesuaian Sedikit)
async function topAnime() {
    try {
        const url = "https://myanimelist.net/topanime.php";
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const results = [];

        $(".ranking-list").each((i, el) => {
            const rank = $(el).find(".rank").text().trim();
            const title = $(el).find(".title h3 a").text().trim();
            const animeUrl = $(el).find(".title h3 a").attr("href");
            // Mengambil gambar: prioritas data-src (lazy load), lalu src
            const cover = $(el).find(".title img").attr("data-src") || $(el).find(".title img").attr("src");
            const score = $(el).find(".score span").text().trim();
            const info = $(el).find(".information").text().split("\n");
            const type = info[1]?.trim() || "TV";
            const members = info[3]?.trim() || "0";

            if (title && animeUrl) {
                results.push({
                    rank,
                    title,
                    score,
                    cover,
                    url: animeUrl,
                    type,
                    members
                });
            }
        });
        return { success: true, data: results };
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

// 2. Search Anime/Manga (Fitur Tambahan)
async function searchAnime(query) {
    try {
        const url = `https://myanimelist.net/anime.php?q=${encodeURIComponent(query)}&cat=anime`;
        const res = await axios.get(url);
        const $ = cheerio.load(res.data);
        const results = [];

        $("tr").each((i, el) => {
            const titleElement = $(el).find("td.borderClass strong a");
            if (titleElement.length > 0) {
                const title = titleElement.text().trim();
                const link = titleElement.attr("href");
                const desc = $(el).find("div.pt4").text().trim().replace("...read more.", "");
                const type = $(el).find("td.borderClass[width='45']").text().trim();
                const score = $(el).find("td.borderClass[width='50']").text().trim();
                // Gambar di halaman search MAL agak tricky, kita ambil dari img tag
                const cover = $(el).find("td.borderClass div.picSurround img").attr("data-src") || 
                              $(el).find("td.borderClass div.picSurround img").attr("src");

                results.push({
                    title,
                    url: link,
                    cover,
                    desc,
                    type,
                    score
                });
            }
        });
        return { success: true, data: results.slice(0, 20) }; // Ambil 20 hasil
    } catch (err) {
        console.error(err);
        return { success: false, message: err.message };
    }
}

// --- API ROUTES ---

app.get('/api/top', async (req, res) => {
    const data = await topAnime();
    res.json(data);
});

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ success: false, message: "Query kosong" });
    const data = await searchAnime(q);
    res.json(data);
});

// Fallback untuk Vercel
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Jalankan server (Local development)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
