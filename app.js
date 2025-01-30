require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");
const createError = require("http-errors");
const db = require("./lib/dbConnection");

// ✅ Multer setup
const upload = multer();

const orderDetailRouter = require("./routes/order_detail");
const bookingOrderRouter = require("./routes/bookingorder");
const menuRouter = require("./routes/menu");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

// ✅ Ensure CORS is applied correctly
app.use(
  cors({
    origin: "*", // Allow all origins (adjust as needed)
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ✅ Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.none()); // Handle form-data
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// ✅ Handle CORS preflight requests globally
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(204);
});

// ✅ Define API routes
app.use("/detail", orderDetailRouter);
app.use("/master-menu", menuRouter);
app.use("/order", bookingOrderRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// ✅ Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});

// ✅ Connect to MySQL
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err.message);
  } else {
    console.log("✅ Connected to MySQL database!");
    connection.release();
  }
});

// ✅ Set up server port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// ✅ Export app for Vercel
module.exports = app;
