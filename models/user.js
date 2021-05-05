const mongoose = require("mongoose");
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    validate: {
      validator(v) {
        // eslint-disable-next-line no-useless-escape
        return /^https?:\/\/(www\.)?([a-zA-Z0-9\-])+\.([a-zA-Z])+\/?([a-zA-Z0-9\-\._~:\/\?#\[\]@!\$&’\(\)\*\+,;=]+)/.test(v);
      },
      message: (props) => `Ошибка в ссылке ${props.value}`,
    },
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Неправильный формат почты',
    },
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

module.exports = mongoose.model("User", userSchema);
