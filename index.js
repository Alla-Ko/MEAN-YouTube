const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const path = require("path");
const account = require("./routs/account");
const config = require("./config/db");
const session = require("express-session"); // Додано express-session

const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: config.secret, // Замініть на ваш секретний ключ
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);

mongoose.connect(config.db, {});
mongoose.connection.on("connected", () => {
  console.log("BD is ok");
});
mongoose.connection.on("error", (err) => {
  console.log("BD is not ok " + err);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.use("/account", account);

app.listen(port, () => {
  console.log("Сервер запущений по порту: " + port);
});
