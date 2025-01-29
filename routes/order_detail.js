const express = require("express");
const router = express.Router();
const db = require("../lib/dbConnection"); // Ensure dbConnection is correctly set up

// 🔹 1. CREATE - Tambah Order Detail
router.post("/order_detail", (req, res) => {
  const { menu_id, order_id, quantity } = req.body;

  if (!menu_id || !order_id || !quantity) {
    return res
      .status(400)
      .json({ message: "menu_id, order_id, dan quantity wajib diisi!" });
  }

  const query = `INSERT INTO order_detail (menu_id, order_id, quantity, created_at, updated_at) 
                   VALUES (?, ?, ?, CURDATE(), CURDATE())`;

  db.query(query, [menu_id, order_id, quantity], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({
          message: "Gagal menambahkan order detail",
          error: err.message,
        });
    }
    res
      .status(201)
      .json({
        message: "Order detail berhasil ditambahkan",
        id: result.insertId,
      });
  });
});

// 🔹 2. READ - Mendapatkan Semua Order Detail
router.get("/order_detail", (req, res) => {
  db.query("SELECT * FROM order_detail", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err.message });
    }
    res.status(200).json(results);
  });
});

// 🔹 3. READ - Mendapatkan Order Detail Berdasarkan ID
router.get("/order_detail/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM order_detail WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Order detail tidak ditemukan" });
    }
    res.status(200).json(results[0]);
  });
});

// 🔹 4. UPDATE - Mengubah Jumlah Quantity dalam Order Detail
router.put("/order_detail/:id", (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    return res.status(400).json({ message: "Quantity wajib diisi!" });
  }

  const query = `UPDATE order_detail SET quantity = ?, updated_at = CURDATE() WHERE id = ?`;

  db.query(query, [quantity, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal memperbarui data", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order detail tidak ditemukan" });
    }
    res.status(200).json({ message: "Order detail berhasil diperbarui" });
  });
});

// 🔹 5. DELETE - Menghapus Order Detail
router.delete("/order_detail/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM order_detail WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal menghapus data", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order detail tidak ditemukan" });
    }
    res.status(200).json({ message: "Order detail berhasil dihapus" });
  });
});

module.exports = router;
