require("dotenv").config();
const db = require("./lib/dbConnection");
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const multer = require("multer");
const upload = multer();
const orderdetailrouter = require("./routes/order_detail");
const bookingorderRouter = require("./routes/bookingorder");
const menuRouter = require("./routes/menu");
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const bodyParserMiddleware = [
  express.json(),
  express.urlencoded({ extended: true }),
  upload.none(),
];
const app = express();

// view engine setup
app.use(cors());
app.use(bodyParserMiddleware);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/detail", orderdetailrouter);
app.use(express.static(path.join(__dirname, "public")));
app.use("/master-menu", menuRouter);
app.use("/order", bookingorderRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    error: req.app.get("env") === "development" ? err : {},
  });
});
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Error connecting to MySQL:", err.message);
  } else {
    console.log("✅ Connected to MySQL database!");
    connection.release();
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
module.exports = app;
