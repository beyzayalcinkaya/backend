const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// PostgreSQL bağlantısı için Render ortam değişkenleri kullanılıyor
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT), // Portu sayı olarak alıyoruz
  ssl: {
    rejectUnauthorized: false, // Render PostgreSQL için gerekli
  },
});

const app = express();
app.use(cors());
app.use(express.json());

// Ana route
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
    console.log("Sorgu sonucu:", result.rows);

    if (result.rows.length === 0) {
      console.log("Blog bulunamadı!");
      return res.status(404).send("Blog not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tek blog hatasıı:", err);
    res.status(500).send("Database error");
  }
});

// Render port veya default 3002
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
