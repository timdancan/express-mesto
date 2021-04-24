const Card = require("../models/card.js");

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    if (!cards) {
      res.status(404).json({ message: "карточка или пользователь не найден." });
    }
    res.send(cards);
  } catch (e) {
    res.status(500).json({ message: "ошибка по-умолчанию." });
  }
};

exports.createCard = async (req, res) => {
  try {
    const owner = req.user._id;
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner });
    res.json(card);
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

exports.deleteCard = (req, res) => {
  const { cardId } = req.params;
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      }
      return res.send(card);
    })
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные",
        });
      } else {
        res.status(500).send({ message: "Произошла ошибка" });
      }
    });
};

exports.likeCard = (req, res) => {
  const id = req.params.cardId;
  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      }
      return res.send("Лайк поставлен");
    })
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для постановки лайка",
        });
      } else {
        res.status(500).send({ message: "Произошла ошибка" });
      }
    });
};

exports.dislikeCard = (req, res) => {
  const id = req.params.cardId;
  Card.findByIdAndUpdate(
    id,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        return res
          .status(404)
          .send({ message: "Карточка с указанным _id не найдена" });
      }
      return res.send("Лайк удален");
    })
    .catch((e) => {
      if (e.name === "CastError") {
        res.status(400).send({
          message: "Переданы некорректные данные для снятия лайка",
        });
      } else {
        res.status(500).send({ message: "Произошла ошибка" });
      }
    });
};
