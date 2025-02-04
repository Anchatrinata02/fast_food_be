const express = require("express");
const router = express.Router();
const db = require("../lib/dbConnection"); // Ensure dbConnection is correctly set up

// ✅ 1. CREATE - Add a new menu item
router.post("/menu", (req, res) => {
  const { name, price, description, quantity } = req.body;

  if (!name || !price || !description || !quantity) {
    return res.status(400).json({ message: "All fields except image_id are required" });
  }

  const query = `INSERT INTO menu (name, price, description, quantity, created_at, updated_at) 
  VALUES (?, ?, ?, ?, NOW(), NOW())`;

db.query(query, [name, price, description, quantity], (err, results) => {
if (err) {
console.error("Database Error:", err.message);
return res.status(500).json({ message: "Internal Server Error", error: err.message });
}
res.status(201).json({ message: "Menu item added successfully", menuId: results.insertId });
});
});

// ✅ 2. READ - Get all menu items
router.get("/menu", (req, res) => {
  const query = "SELECT * FROM menu";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
    res.status(200).json(results);
  });
});

// ✅ 3. READ - Get a single menu item by ID
router.get("/menu/:id", (req, res) => {
  const menuId = req.params.id;
  const query = "SELECT * FROM menu WHERE id = ?";

  db.query(query, [menuId], (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json(results[0]);
  });
});

// ✅ 4. UPDATE - Update a menu item
router.put("/menu/:id", (req, res) => {
  const menuId = req.params.id;
  const { name, price, description, quantity } = req.body; // Hapus image_id

  // Validasi input
  if (!name || !price || !description || !quantity) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (isNaN(price) || isNaN(quantity)) {
    return res.status(400).json({ message: "Price and quantity must be numbers" });
  }

  if (isNaN(menuId)) {
    return res.status(400).json({ message: "Invalid menu ID" });
  }

  const query = `UPDATE menu 
                 SET name = ?, price = ?, description = ?, quantity = ?, updated_at = NOW() 
                 WHERE id = ?`; // Hapus image_id dari query

  const queryParams = [name, price, description, quantity, menuId]; // Hapus image_id dari parameter

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item updated successfully" });
  });
});


// ✅ 5. DELETE - Delete a menu item
router.delete("/menu/:id", (req, res) => {
  const menuId = req.params.id;
  const query = "DELETE FROM menu WHERE id = ?";

  db.query(query, [menuId], (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }
    res.status(200).json({ message: "Menu item deleted successfully" });
  });
});

module.exports = router;