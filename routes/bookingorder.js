const express = require("express");
const router = express.Router();
const db = require("../lib/dbConnection"); // Ensure dbConnection is correctly set up

// 🔹 1. CREATE - Tambah Booking Order dengan Auto-Generated order_number
router.post("/bookingorder", (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id wajib diisi!" });
  }

  // Generate order_number
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(
    today.getMonth() + 1
  ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const countQuery = `SELECT COUNT(*) AS count FROM bookingorder WHERE order_number LIKE 'ORD${dateStr}%'`;

  db.query(countQuery, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal menghitung jumlah order", error: err.message });
    }

    const count = results[0].count + 1;
    const orderNumber = `ORD${dateStr}${String(count).padStart(4, "0")}`;

    const insertQuery = `INSERT INTO bookingorder (order_number, user_id, created_at, updated_at) 
                             VALUES (?, ?, NOW(), NOW())`;

    db.query(insertQuery, [orderNumber, user_id], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Gagal menambahkan data", error: err.message });
      }
      res
        .status(201)
        .json({
          message: "Booking order berhasil ditambahkan",
          order_number: orderNumber,
          id: result.insertId,
        });
    });
  });
});

// 🔹 2. READ - Mendapatkan Semua Booking Order
router.get("/bookingorder", (req, res) => {
  db.query("SELECT * FROM bookingorder", (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err.message });
    }
    res.status(200).json(results);
  });
});

// 🔹 3. READ - Mendapatkan Booking Order Berdasarkan ID
router.get("/bookingorder/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM bookingorder WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal mengambil data", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Booking order tidak ditemukan" });
    }
    res.status(200).json(results[0]);
  });
});

// 🔹 4. UPDATE - Mengubah Data Booking Order
router.put("/bookingorder/:id", (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: "user_id wajib diisi!" });
  }

  const query = `UPDATE bookingorder SET user_id = ?, updated_at = NOW() WHERE id = ?`;

  db.query(query, [user_id, id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal memperbarui data", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking order tidak ditemukan" });
    }
    res.status(200).json({ message: "Booking order berhasil diperbarui" });
  });
});

// 🔹 5. DELETE - Menghapus Data Booking Order
router.delete("/bookingorder/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM bookingorder WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Gagal menghapus data", error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Booking order tidak ditemukan" });
    }
    res.status(200).json({ message: "Booking order berhasil dihapus" });
  });
});

module.exports = router;
