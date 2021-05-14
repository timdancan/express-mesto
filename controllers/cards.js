const NotFoundError = require("../errors/not-found-err.js");
const Card = require("../models/card.js");
const BadRequestError = require("../errors/bad-request-error.js");

exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    if (!cards) {
      throw new NotFoundError("карточка или пользователь не найден");
    }
    res.send(cards);
  } catch (e) {
    next(e);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const owner = req.user._id;
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner });
    res.json(card);
  } catch (e) {
    if (e.name === "ValidationError") {
      throw new BadRequestError("Переданы некорректные данные");
    } else {
      next(e);
    }
  }
};

exports.deleteCard = (req, res, next) => {
  const owner = req.user._id;
  const { cardId } = req.params;
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError("карточка или пользователь не найден");
      }
      if (card.owner.toString() !== owner) {
        throw new BadRequestError("Нет прав на удаление карточки");
      }
      Card.findByIdAndRemove(cardId).then(() => {
        res.send(card);
      });
    })
    .catch((e) => {
      if (e.name === "CastError") {
        throw new BadRequestError("Переданы некорректные данные");
      } else {
        next(e);
      }
    });
};

exports.likeCard = (req, res, next) => {
  const id = req.params.cardId;
  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((data) => {
      if (!data) {
        throw new NotFoundError("карточка или пользователь не найден");
      }
      return res.json(data);
    })
    .catch((e) => {
      if (e.name === "CastError") {
        throw new BadRequestError(
          "Переданы некорректные данные для постановки лайка",
        );
      } else {
        next(e);
      }
    });
};

exports.dislikeCard = (req, res, next) => {
  const id = req.params.cardId;
  Card.findByIdAndUpdate(id, { $pull: { likes: req.user._id } }, { new: true })
    .then((data) => {
      if (!data) {
        throw new NotFoundError("карточка или пользователь не найден");
      }
      return res.json(data);
    })
    .catch((e) => {
      if (e.name === "CastError") {
        throw new BadRequestError(
          "Переданы некорректные данные для снятия лайка",
        );
      } else {
        next(e);
      }
    });
};
