const express = require("express");
const router = express.Router();

const {
  addUser,
  getUsers,
  deleteUser,
  editUserForm,
  updateUser
} = require("../controllers/userController");

// READ (homepage - show all users)
router.get("/", getUsers);

// CREATE
router.post("/add", addUser);

// DELETE
router.get("/delete/:id", deleteUser);

// SHOW EDIT FORM
router.get("/edit/:id", editUserForm);

// UPDATE
router.post("/update/:id", updateUser);

module.exports = router;