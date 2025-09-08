const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "blog_data",
  password: "1234",
  port: 5439,
});

const app = express();
app.use(cors());
app.use(express.json());

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
  console.log("Parametre gelen name:", id);
  try {
    const result = await pool.query(
      "SELECT * FROM myBlogs WHERE id = $1",

      [id]
    );
    console.log("Sorgu sonucu:", result.rows);

    if (result.rows.length === 0) {
      console.log("Blog bulunamadı!");
      return res.status(404).send("Blog not found");
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Tek blog hatası:", err);
    res.status(500).send("Database error");
  }
});

const PORT = 3002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
