const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require('bcryptjs');
const express = require("express");
const router = express.Router();
const db = require("../lib/dbConnection");
/* GET users listing. */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ? LIMIT 1";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];

    console.log(req.body);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        user_level: user.user_level,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        phone_number: user.phone_number,
        username: user.username,
        user_level: user.user_level,
      },
    });
  });
});
router.post("/register", async (req, res) => {
  const {
    nama,
    alamat,
    email,
    password,
    phone_number,
    user_level,
    username,
    image_profile,
  } = req.body;

  // Validate input fields
  console.log(req.body)
  if (!nama || !email || !password || !phone_number || !username) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    // Check if email or username already exists
    db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [email, username],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }
        if (results.length > 0) {
          return res
            .status(400)
            .json({ message: "Email or Username already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const query = `INSERT INTO users (nama, alamat, email, password, phone_number, user_level, username, image_profile, created_at, updated_at) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;

        db.query(
          query,
          [
            nama,
            alamat,
            email,
            hashedPassword,
            phone_number,
            user_level,
            username,
            image_profile,
          ],
          (err, result) => {
            if (err) {
              console.error("Insert error:", err);
              return res.status(500).json({ message: "Internal Server Error" });
            }
            res
              .status(201)
              .json({
                message: "Users registered successfully",
                userId: result.insertId,
              });
          }
        );
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
