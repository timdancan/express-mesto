const Card = require('../models/card.js')

exports.getCards = async (req, res) => {
  try {

    const cards = await Card.find({})
    if (!cards) {
      res.status(404).json({message: "карточка или пользователь не найден."})
    }
    res.send(cards)
  } catch (e) {
    res.status(500).json({message: "ошибка по-умолчанию."})
  }
}

exports.createCard = async (req, res) => {
  try {
    const owner = req.user._id;
    if (!owner) {
      res.status(400).json({message: "переданы некорректные данные в методы создания карточки, пользователя, обновления аватара пользователя или профиля"})
    }
    const {name, link} = req.body
    const card = await Card.create({ name, link, owner });
    res.json(card);
  } catch (e) {
    res.status(500).json({message: "ошибка по-умолчанию."})
  }
}

exports.deleteCard = async (req, res) => {
  try {
    const {cardId} = req.params
    if (!cardId) {
      res.status(404).json({message: "карточка или пользователь не найден."})
    }
    const card = await Card.findByIdAndDelete(cardId)
    return res.json(card)
  } catch (e) {
    res.status(500).json({message: "ошибка по-умолчанию."})
  }
}

exports.likeCard = async (req, res) => {
  try {
    const id = req.params.cardId
    if (!id) {
      res.status(404).json({message: "карточка или пользователь не найден."})
    }
    await Card.findByIdAndUpdate(
      id,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
  } catch (e) {
    res.status(500).json({message: "ошибка по-умолчанию."})
  }
}

exports.dislikeCard = async (req, res) => {
  try {
    const id = req.params.cardId
    if (!id) {
      res.status(404).json({message: "карточка или пользователь не найден."})
    }
    await Card.findByIdAndUpdate(
      id,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
  } catch (e) {
    res.status(500).json({message: "ошибка по-умолчанию."})
  }
}