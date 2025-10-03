require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: { rejectUnauthorized: false },
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

// BLOG LISTESI

app.get("/blogs", async (req, res) => {
  const langHeader = req.headers["accept-language"];

  const lang = langHeader === "en" ? "en" : "tr";

  const langSuffix = lang === "en" ? "_en" : "_tr";

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

// BLOG DETAY

app.get("/blogs/:id", async (req, res) => {
  const { id } = req.params;

  const langHeader = req.headers["accept-language"];
  const lang = langHeader === "en" ? "en" : "tr";

  const langSuffix = lang === "en" ? "_en" : "_tr";

  const titleColumn = `"title${langSuffix}"`;
  const pageDescColumn = `"page_desc${langSuffix}"`;

  const selectQuery = `
    SELECT 
      id, 
      ${titleColumn} AS title, 
      ${pageDescColumn} AS page_desc 
    FROM myblogs 
    WHERE id = $1
  `;

  try {
    const result = await pool.query(selectQuery, [id]);

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
