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
    const user = await User.findById(req.params.cardId);
    if (!user) {
      res.status(404).json({ message: "карточка или пользователь не найден." });
    }
    res.send(user);
  } catch (e) {
    if (e.name === 'CastError') {
      res.status(400).send({
        message: 'Переданы некорректные данные',
      });
    } else {
      res.status(500).send({ message: 'ошибка по-умолчанию' });
    }
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    if (!req.body) {
      res.status(400).json({
        message:
          "переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля",
      });
    }
    const post = await User.create({ name, about, avatar });
    res.json(post);
  } catch (e) {
    res.status(500).json({ message: "ошибка по-умолчанию." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, about } = req.body;
    if (!userId) {
      res.status(400).json({
        message:
          "переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля",
      });
    }
    const updatedPost = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true },
    );
    return res.json(updatedPost);
  } catch (e) {
    return res.status(500).json({ message: "ошибка по-умолчанию." });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const { avatar } = req.body;
    if (!userId) {
      res.status(400).json({
        message:
          "переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля",
      });
    }
    const updatedPost = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true },
    );
    return res.json(updatedPost);
  } catch (e) {
    return res.status(500).json({ message: "ошибка по-умолчанию." });
  }
};
