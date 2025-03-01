const express = require('express')
const path = require('path')
require('dotenv').config();
const database = require("./config/database");
const clientRoutes = require("./routes/client/index.route");

const app = express()
const port = 3000

// Kết nối database
database.connect();

// Thiết lập thư mục views và view engine pug
app.set('views', path.join(__dirname, 'views')); // Thư mục chứa file Pug
app.set('view engine', 'pug'); // Thiết lập pug làm view engine

// Thiết lập thư mục chứ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Thiết lập đường dẫn
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})