const express = require("express");
const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getUserInfo,
} = require("../controllers/users.js");

const usersRoutes = express.Router();

usersRoutes.get("/", getUsers);

usersRoutes.get("/:userId", getUserById);
usersRoutes.get("/me", getUserInfo);
usersRoutes.patch("/me", updateProfile);
usersRoutes.patch("/me/avatar", updateAvatar);

module.exports = usersRoutes;
