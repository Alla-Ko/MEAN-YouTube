const express = require("express");
const router = express.Router();
const User = require("./../models/user");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/db");

router.post("/reg", async (req, res) => {
  let newUser = new User({
    name: req.body.name,
    email: req.body.email,
    login: req.body.login.toLowerCase(),
    password: req.body.password,
  });

  try {
    // Викликаємо метод addUser на екземплярі newUser
    const user = await newUser.addUser();
    return res.json({ success: true, newUser: user });
  } catch (err) {
    return res.json({
      success: false,
      msg: `Користувач не був доданий ${err}`,
    });
  }
});

router.post("/auth", async (req, res) => {
  const login = req.body.login.toLowerCase();
  const password = req.body.password;

  try {
    const user = await User.getUserByLogin(login);
    if (!user) {
      return res.json({ success: false, msg: "Користувач не був знайдений" });
    }

    // Порівнюємо паролі
    const isMatch = await User.comparePass(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 3600 * 24, // 24 години
      });
      return res.json({
        success: true,
        token: "JWT " + token,
        user: {
          id: user._id,
          name: user.name,
          login: user.login,
          email: user.email,
        },
      });
    } else {
      return res.json({
        success: false,
        msg: "Невірна комбінація логін/пароль",
      });
    }
  } catch (err) {
    return res.json({
      success: false,
      msg: `Помилка: ${err}`,
    });
  }
});

router.get(
  "/dashboard/:login", // Динамічний параметр id
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { login } = req.params; // Отримуємо id з параметрів маршруту
      const user = await User.getUserByLogin(login); // Передбачається, що у вас є метод getUserById

      if (!user) {
        return res
          .status(404)
          .json({ success: false, msg: "Користувача не знайдено" });
      }

      return res.json(user);
    } catch (error) {
      console.error("Помилка отримання користувача:", error);
      return res.status(500).json({ success: false, msg: "Помилка сервера" });
    }
  }
);

module.exports = router;
