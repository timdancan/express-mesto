const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { celebrate, Joi } = require('celebrate');
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const auth = require("./middlewares/auth.js");
const { createUser, authAdmin } = require("./controllers/users.js");

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
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
  }),
}), authAdmin);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string(),
    email: Joi.string().required(),
    password: Joi.string().required().min(8),
  }),
}), createUser);
app.use("/users", auth, usersRouter);
app.use("/cards", auth, cardsRouter);
app.use((req, res) => {
  res.status(404).send({ message: `Ресурс по адресу ${req.path} не найден` });
});

main();
