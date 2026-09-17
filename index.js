const express = require('express')
const path = require('path')
require('dotenv').config();
const database = require("./config/database");
const adminRoutes = require("./routes/admin/index.route");
const clientRoutes = require("./routes/client/index.route");
const variableConfig = require("./config/variable");
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const session = require('express-session');

const app = express()
const port = process.env.PORT || 3000

// Kết nối database
database.connect();

// Thiết lập thư mục views và view engine pug
app.set('views', path.join(__dirname, 'views')); // Thư mục chứa file Pug
app.set('view engine', 'pug'); // Thiết lập pug làm view engine

// Thiết lập thư mục chứ file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Tạo biến toàn cục trong file PUG
app.locals.pathAdmin = variableConfig.pathAdmin;

// Tạo biến toàn cục trong các file js backend
global.pathAdmin = variableConfig.pathAdmin;

// Cho phép gửi data lên dạng json
app.use(express.json());

// Sử dụng cookieParser
app.use(cookieParser(process.env.COOKIE_SECRET));

// Hiển thị thông báo sau khi load lại trang
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60000 }
}));
app.use(flash());

// Thiết lập đường dẫn
app.use(`/${variableConfig.pathAdmin}`, adminRoutes);
app.use("/", clientRoutes);

app.listen(port, () => {
  console.log(`Website đang chạy trên cổng ${port}`)
})