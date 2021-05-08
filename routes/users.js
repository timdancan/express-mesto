const express = require("express");
const { celebrate, Joi } = require('celebrate');
const { ObjectId } = require('mongoose').Types;
const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getUserInfo,
} = require("../controllers/users.js");

const usersRoutes = express.Router();

usersRoutes.get("/", getUsers);

usersRoutes.get("/:userId", celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (ObjectId.isValid(value)) {
        return value;
      }
      return helpers.message('Невалидный id пользователя');
    }),
  }),
}), getUserById);

usersRoutes.get("/me", getUserInfo);

usersRoutes.patch("/me", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);

usersRoutes.patch("/me/avatar", updateAvatar);

module.exports = usersRoutes;
