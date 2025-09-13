require("dotenv").config(); // .env dosyasını okuyabilmek için
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// Pool ayarları: Render Postgres ile bağlantı
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // .env'deki DATABASE_URL kullanılacak
  ssl: { rejectUnauthorized: false }, // Render Postgres SSL zorunlu
});

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// Tüm bloglar
app.get("/blogs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM myBlogs ORDER BY id ASC");
    console.log("Tüm bloglar:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Tüm bloglar hatası:", err);
    res.status(500).send("Database error");
  }
});

// Tek blog
app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM myBlogs WHERE id = $1", [
      id,
    ]);
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
