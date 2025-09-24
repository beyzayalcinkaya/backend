require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Postgres bağlantısı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Render/Postgres için gerekli
});

const app = express();
app.use(cors());
app.use(express.json());

// Ana rota
app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// BLOG LISTESI (özet için)
app.get("/blogs", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, title, desc1, reading_time FROM myblogs ORDER BY id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Tüm bloglar hatası:", err);
    res.status(500).send("Database error");
  }
});

// BLOG DETAY (tam veri)
app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, title, page_desc FROM myBlogs WHERE id = $1",

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
