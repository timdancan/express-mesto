const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = "secret_key";

module.exports = (req, res, next) => {
  const token = req.cookies.parrotToken;
  if (!token) {
    return res.status("401").send({ message: "необходма авторизация" });
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET_KEY);
  } catch (e) {
    return res.status(403).send({ message: "Нет доступа" });
  }

  req.user = payload;

  return next();
};
