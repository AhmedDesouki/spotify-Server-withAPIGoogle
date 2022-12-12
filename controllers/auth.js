const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(
  "737905898173-unkk0foqm05v27qbt5espfkpc4lnu5jk.apps.googleusercontent.com"
);
const loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send({ message: "invalid email!" });

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return res.status(400).send({ message: "Invalid password!" });

  const token = user.generateAuthToken();
  res
    .status(200)
    .send({ data: token, message: "You are signed in successfully" });
};
const googlelogin = async (req, res) => {
  const { token } = req.body;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience:
      "737905898173-unkk0foqm05v27qbt5espfkpc4lnu5jk.apps.googleusercontent.com",
  });

  const { name, email } = ticket.getPayload();
  const user = await User.find({ email: email });
  if (!user) {
    const newUser = await User.create({
      name: name,
      email: email,
      password: "Q_qweewq123",
      gender: "male",
      month: "1",
      date: "1",
      year: "1",
    });
    newUser.save();
    console.log(newUser);
    res.status(201);
    res.json(newUser);
  } else {
    res.status(201);
    res.json(user);
  }
};

module.exports = {
  googlelogin,
  loginUser,
};
