const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Fetching users, please try again later", 500);
    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const { name, email, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Singing up failed, please try again later");
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User already exists!", 422);
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password,
    image:
      "https://png.pngtree.com/png-vector/20190710/ourmid/pngtree-user-vector-avatar-png-image_1541962.jpg",
    places: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Registration failed", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Logging in failed, please try again later");
    return next(error);
  }

  if (!existingUser || existingUser.password !== password) {
    const error = new HttpError("Invalid credentials.", 401);
    return next(error);
  }

  res.json({ message: "Logged In!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
