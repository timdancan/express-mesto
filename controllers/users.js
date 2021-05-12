const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const NotFoundError = require('../errors/not-found-err.js');
const AuthError = require('../errors/auth-error.js');
const BadRequestError = require('../errors/bad-request-error.js');
const User = require("../models/user.js");
const EmailError = require('../errors/email-error.js');

const JWT_SECRET_KEY = "secret_key";
const saltRounds = 10;

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    if (!users) {
      throw new NotFoundError('карточка или пользователь не найден');
    }
    res.send(users);
  } catch (e) {
    next(e);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new NotFoundError('карточка или пользователь не найден');
    }
    res.send(user);
  } catch (e) {
    if (e.name === "CastError") {
      throw new BadRequestError('Неправильный логин или пароль');
    } else {
      next(e);
    }
  }
};

exports.getUserInfo = async (req, res, next) => {
  try {
    const userId = await User.findById(req.user._id);
    if (!userId) {
      throw new NotFoundError('карточка или пользователь не найден');
    }
    res.send(userId);
  } catch (e) {
    if (e.name === "CastError") {
      throw new BadRequestError('Переданы некорректные данные');
    } else {
      next(e);
    }
  }
};

exports.createUser = async (req, res, next) => {
  const {
    name, about, avatar, email,
  } = req.body;
  bcrypt.hash(req.body.password, saltRounds)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      const userData = {
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      };
      res.send(userData);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError('Переданы неверные данные');
      } else if (err.name === 'MongoError') {
        throw new EmailError('Пользователь с таким email уже зарегистрирован');
      } else {
        next(err);
      }
    })
    .catch(next);
};

exports.updateProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = req.body;
  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('карточка или пользователь не найден');
      }
      return res.json(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        throw new BadRequestError('Переданы некорректные данные');
      }
      next(err);
    });
};

exports.updateAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = req.body;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('карточка или пользователь не найден');
      }
      return res.json(user);
    })
    .catch((err) => {
      if (err.name === "ValidationError" || err.name === "CastError") {
        throw new BadRequestError('Переданы некорректные данные');
      }
      next(err);
    });
};

exports.authAdmin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Не передан email или пароль');
  }
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET_KEY, {
        expiresIn: "7d",
      });
      res.cookie('parrotToken', token, {
        httpOnly: true,
        sameSite: true,
      }).send({ _id: user._id });
    })
    .catch(() => {
      throw new AuthError('Авторизация не пройдена');
    })
    .catch(next);
};
