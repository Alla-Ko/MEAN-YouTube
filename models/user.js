const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Статичні методи
UserSchema.statics.getUserByLogin = function (login, callback) {
  const query = { login: login };
  return this.findOne(query, callback);
};

UserSchema.statics.getUserById = function (id, callback) {
  return this.findById(id, callback);
};

UserSchema.statics.comparePass = function (passFromUser, passFromDB) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(passFromUser, passFromDB, (err, isMatch) => {
      if (err) reject(err);
      resolve(isMatch);
    });
  });
};

// Додавання нового користувача
UserSchema.methods.addUser = function () {
  return new Promise((resolve, reject) => {
    User.findOne({
      $or: [{ login: this.login }, { email: this.email }],
    })
      .then((existingUser) => {
        if (existingUser) {
          return reject("Користувач з таким логіном або електронною поштою вже існує");
        }
        return bcrypt.genSalt(10);
      })
      .then((salt) => {
        return bcrypt.hash(this.password, salt);
      })
      .then((hash) => {
        this.password = hash;
        return this.save(); // Збереження нового користувача
      })
      .then((user) => {
        resolve(user);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
