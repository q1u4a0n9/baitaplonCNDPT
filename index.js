const express = require('express')
const path = require('path')
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);

const homeController = require("./controllers/client/home.controller");
const tourController = require("./controllers/client/tour.controller");

const app = express()
const port = 3000

// Thiết lập thư mục views và view engine pug
app.set('views', path.join(__dirname, 'views')); // Thư mục chứa file Pug
app.set('view engine', 'pug'); // Thiết lập pug làm view engine

// Thiết lập thư mục chứ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', homeController.home)

app.get('/tours', tourController.list)

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})