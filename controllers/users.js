const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const NotFoundError = require('../errors/not-found-err.js');
const AuthError = require('../errors/auth-error.js');
const BadRequestError = require('../errors/bad-request-error.js');
const User = require("../models/user.js");

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
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    if (!email || !password) {
      throw new BadRequestError('переданы некорректные данные в метод создания карточки, пользователя, обновления аватара пользователя и профиля;');
    }
    const hash = await bcrypt.hash(password, saltRounds);
    const post = await User.create({
      name, about, avatar, email, password: hash,
    });
    res.json(post);
  } catch (e) {
    if (e.name === "ValidationError") {
      throw new BadRequestError('Переданы некорректные данные');
    } else {
      next(e);
    }
  }
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
      .catch(() => {
        throw new AuthError('Неправильный логин или пароль');
      })
      .catch(next);
  });
};
