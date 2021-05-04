const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const JWT_SECRET_KEY = "secret_key";
const saltRounds = 10;

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res.status(404).json({ message: "карточка или пользователь не найден." });
    }
    res.send(users);
  } catch (e) {
    res.status(500).json({ message: "ошибка по-умолчанию." });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "карточка или пользователь не найден." });
    }
    res.send(user);
  } catch (e) {
    if (e.name === "CastError") {
      res.status(400).send({
        message: "Переданы некорректные данные",
      });
    } else {
      res.status(500).send({ message: "ошибка по-умолчанию" });
    }
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const userId = await User.findById(req.user._id);
    if (!userId) {
      res.status(404).json({ message: "карточка или пользователь не найден." });
    }
    res.send(userId);
  } catch (e) {
    if (e.name === "CastError") {
      res.status(400).send({
        message: "Переданы некорректные данные",
      });
    } else {
      res.status(500).send({ message: "ошибка по-умолчанию" });
    }
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    if (!email || !password) {
      res.status(400).send({ message: "переданы некорректные данные в метод создания карточки, пользователя, обновления аватара пользователя и профиля;" });
    }
    const hash = await bcrypt.hash(password, saltRounds);
    const post = await User.create({
      name, about, avatar, email, password: hash,
    });
    res.json(post);
  } catch (e) {
    if (e.name === "ValidationError") {
      res.status(400).send({
        message: "Переданы некорректные данные",
      });
    } else {
      res.status(500).send({ message: "ошибка по-умолчанию" });
    }
  }
};

exports.updateProfile = (req, res) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Карточка или пользователь не найден." });
      }
      return res.json(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).send({
          message: "Переданы неправильные данные",
        });
      }
      return res.status(500).send({ message: "Произошла ошибка" });
    });
};

exports.updateAvatar = (req, res) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Карточка или пользователь не найден." });
      }
      return res.json(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).send({
          message: "Переданы неправильные данные",
        });
      }
      return res.status(500).send({ message: "Произошла ошибка" });
    });
};

exports.authAdmin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({ message: "Не передан email или пароль" });
  }
  User.findOne({ email }).select('+password').then((admin) => {
    if (!admin) {
      Promise.reject(new Error("Неправильная почта или пароль"));
    }
    bcrypt
      .compare(password, admin.password)
      .then((matched) => {
        if (!matched) {
          Promise.reject(new Error("Неправильная почта или пароль"));
        }
        const token = jwt.sign({ _id: admin._id }, JWT_SECRET_KEY, {
          expiresIn: "7d",
        });
        res.cookie('parrotToken', token, {
          httpOnly: true,
          sameSite: true,
        }).send({ _id: admin._id });
      })
      .catch((e) => {
        res.status(401).send({ message: e.message });
      });
  });
};
