const User = require("../models/user.js");

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

exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const post = await User.create({ name, about, avatar });
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
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Карточка или пользователь не найден." });
      }
      return res.send("Данные профиля обновлены");
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
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send({ message: "Карточка или пользователь не найден." });
      }
      return res.send("Аватар обновлен");
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
