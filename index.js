require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Postgres bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render/Postgres için gerekli
  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors());
app.use(express.json());

// Ana rota
app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// ------------------------------------------------------------------
// BLOG LISTESI (ÇOK DİLLİ) - title ve desc1 için dil desteği eklendi
// ------------------------------------------------------------------
app.get("/blogs", async (req, res) => {
  // 1. Dil bilgisini HTTP başlığından al (Frontend'den gelen 'Accept-Language')
  const langHeader = req.headers["accept-language"];
  // Gelen başlık 'en' ise 'en' kullan, aksi halde 'tr' kullan
  const lang = langHeader === "en" ? "en" : "tr";

  // 2. PostgreSQL sütun son ekini belirle
  const langSuffix = lang === "en" ? "_en" : "_tr";

  // 3. PostgreSQL sorgusunu dinamik olarak oluştur
  // title_tr/title_en ve desc1_tr/desc1_en sütunlarından veriyi çek,
  // frontend'e sadece 'title' ve 'desc1' olarak gönder.
  const selectQuery = `
    SELECT 
      id, 
      name, 
      reading_time, 
      "title${langSuffix}" AS title, 
      "desc1${langSuffix}" AS desc1 
    FROM myblogs 
    ORDER BY id ASC
  `;

  try {
    const result = await pool.query(selectQuery);
    res.json(result.rows);
  } catch (err) {
    console.error("Tüm bloglar hatası:", err);
    res.status(500).send("Database error");
  }
});

// ------------------------------------------------------------------
// BLOG DETAY (TEK DİLLİ) - Şimdilik sadece Türkçe veri çekiyor
// ------------------------------------------------------------------
app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;

  // NOT: Bu rota, şimdilik sadece mevcut TR (page_desc_tr) verisini çeker.
  // Çok dilli detay desteği için daha sonra güncellenmelidir.

  try {
    const result = await pool.query(
      "SELECT id, title_tr AS title, page_desc_tr AS page_desc FROM myBlogs WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("Blog not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tek blog hatası:", err);
    res.status(500).send("Database error");
  }
});

// Backend portu
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("DATABASE_URL:", process.env.DATABASE_URL);
