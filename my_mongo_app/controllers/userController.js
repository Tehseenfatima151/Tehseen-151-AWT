const User = require("../models/userModel");

// CREATE
exports.addUser = async (req, res) => {
  try {
    await User.create(req.body);
    res.redirect("/users"); // redirect back to list page
  } catch (err) {
    console.error(err);
    res.status(400).send("Error inserting data ❌");
  }
};

// READ (Show all users)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.render("index", { users });
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
};

// DELETE
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.redirect("/users");
  } catch (err) {
    res.status(400).send("Error deleting user");
  }
};

// SHOW EDIT FORM
exports.editUserForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render("edit", { user });
  } catch (err) {
    res.status(400).send("User not found");
  }
};

// UPDATE
exports.updateUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.params.id, req.body);
    res.redirect("/users");
  } catch (err) {
    res.status(400).send("Error updating user");
  }
};
