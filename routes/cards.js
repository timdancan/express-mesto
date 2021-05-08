const express = require("express");
const { celebrate, Joi } = require('celebrate');
const { ObjectId } = require('mongoose').Types;

const cardsRoutes = express.Router();
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require("../controllers/cards.js");

cardsRoutes.get("/", getCards);

cardsRoutes.post("/", celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    link: Joi.required(),
  }),
}), createCard);

cardsRoutes.delete("/:cardId", celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (ObjectId.isValid(value)) {
        return value;
      }
      return helpers.message('Невалидный id пользователя');
    }),
  }),
}), deleteCard);

cardsRoutes.put("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (ObjectId.isValid(value)) {
        return value;
      }
      return helpers.message('Невалидный id пользователя');
    }),
  }),
}), likeCard);

cardsRoutes.delete("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().custom((value, helpers) => {
      if (ObjectId.isValid(value)) {
        return value;
      }
      return helpers.message('Невалидный id пользователя');
    }),
  }),
}), dislikeCard);

module.exports = cardsRoutes;
