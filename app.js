const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { errors } = require('celebrate');
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const auth = require("./middlewares/auth.js");
const { createUser, authAdmin } = require("./controllers/users.js");
const NotFoundError = require("./errors/not-found-err.js");
const errorHandler = require("./middlewares/error-handler.js");

const {
  PORT = 3000,
  MONGO_URL = "mongodb://localhost:27017/mestodb",
} = process.env;

const app = express();
app.use(express.json());
app.use(cookieParser());

async function main() {
  await mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  await app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
  });
}

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), authAdmin);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().custom((value, helpers) => {
      if (validator.isURL(value, { require_protocol: true })) {
        return value;
      }
      return helpers.message('Поле должно быть валидным url-адресом');
    }),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);
app.use("/users", auth, usersRouter);
app.use("/cards", auth, cardsRouter);
app.use((req) => {
  throw new NotFoundError(`Ресурс по адресу ${req.path} не найден`);
});
app.use(errors());
app.use(errorHandler);

main();
