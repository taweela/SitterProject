const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { registerValidation, loginValidation, registerProviderValidation } = require('../utils/validation');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_APIKEY);

const saltLength = 10;
// eslint-disable-next-line prefer-const
let refreshTokens = [];

const authConfig = {
  expireTime: '1d',
  refreshTokenExpireTime: '1d', // this will be the timeout for the user
};

// Endpoint: Register Users
router.post('/register', async (req, res) => {
  // validate request
  const { error } = req.body.role == 'client' ? registerValidation(req.body) : registerProviderValidation(req.body);

  if (error) return res.status(400).send(error.details[0].message);
  // check for unique user
  const emailExists = await User.findOne({ email: req.body.email });
  if (emailExists) { return res.status(400).send('Email already exists'); }

  // hash the password
  const salt = await bcrypt.genSalt(saltLength);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const { lat, lng } = req.body.address.geometry.location;
  let userTemp = {};
  if (req.body.role == 'serviceProvider') {
    userTemp = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role,
      address: req.body.address.formatted_address,
      providerType: req.body.providerType,
      latitude: lat,
      longitude: lng,
      age: req.body.age,
      status: 'pending'
    }
  } else {
    userTemp = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashPassword,
      role: req.body.role,
      address: req.body.address.formatted_address,
      latitude: lat,
      longitude: lng,
      status: 'active'
    }
  }
  const user = new User(userTemp);

  // create an access token
  const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: authConfig.expireTime });

  try {
    const savedUser = await user.save();

    // remove password
    delete savedUser._doc.password;

    return res.send({ user: savedUser, accessToken, message: 'User successfully registered' });
  } catch (err) {
    return res.status(400).send(err);
  }
});

// Endpoint: Login user
router.post('/login', async (req, res) => {
  // validate request
  const { error } = loginValidation(req.body);
  if (error) { return res.status(400).send(error.details[0].message); }

  const user = await User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }).select('-__v');
  if (!user) { return res.status(400).send({ message: 'Email provided is not a registered account' }); }
  if (user.role == 'admin') {
    return res.status(400).send({ message: 'User role is not allowed' });
  }
  const tokenExpiry = req.body.remember ? '60d' : authConfig.expireTime;
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({ message: 'Email or password not found!' });
  if (user.status == 'pending') {
    return res.status(400).send({ message: 'Your account is pending, please wait.' });
  }
  if (user.status == 'declined') {
    return res.status(400).send({ message: 'Your account is declined' });
  }

  // validation passed, create tokens
  const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: tokenExpiry });
  const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.refreshTokenExpireTime });
  refreshTokens.push(refreshToken);

  // remove password
  delete user._doc.password;

  const userData = user;
  const response = {
    userData,
    accessToken,
    status: 'success'
  };
  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(new Date().getTime() + 200 * 1440 * 60 * 1000),
    httpOnly: true,
  });
  return res.send(response);
});

// Endpoint: Login Admin
router.post('/admin/login', async (req, res) => {

  // validate request
  const { error } = loginValidation(req.body);
  if (error) { return res.status(400).send(error.details[0].message); }

  const user = await User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }).select('-__v');
  if (!user) { return res.status(400).send({ message: 'Email provided is not a registered account' }); }

  if (user.role !== 'admin') {
    return res.status(400).send({ message: 'User role is not allowed' });
  }

  const tokenExpiry = req.body.remember ? '60d' : authConfig.expireTime;
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send({ message: 'Email or password not found!' });

  // validation passed, create tokens
  const accessToken = jwt.sign({ _id: user._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: tokenExpiry });
  const refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: authConfig.refreshTokenExpireTime });
  refreshTokens.push(refreshToken);

  // remove password
  delete user._doc.password;

  const userData = user;
  const response = {
    userData,
    accessToken,
    status: 'success'
  };
  res.cookie('refreshToken', refreshToken, {
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(new Date().getTime() + 200 * 1440 * 60 * 1000),
    httpOnly: true,
  });
  return res.send(response);
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("User with this email does not exist.");
  }

  const frontendUrl = process.env.FRONTEND_URL;
  const token = jwt.sign({ email }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '1h' });

  const resetLink = `${frontendUrl}/reset-password/${token}`;
  const msg = {
    to: email,
    from: process.env.SENDER_EMAIL,
    subject: 'Password Reset Request',
    text: `You requested for a password reset. Click here to reset your password: ${resetLink}`,
    html: `<strong>You requested for a password reset. Click here to reset your password:</strong> <a href="${resetLink}">Reset Password</a>`
  };
  try {
    await sgMail.send(msg);

    return res.send({ status: "success", message: "Password reset link sent to your email." });
  } catch (error) {
    return res.status(500).send({ status: 'error', message: error.toString() })
  }

});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.AUTH_TOKEN_SECRET);
    const email = decoded.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid token or user does not exist.");
    }
    const salt = await bcrypt.genSalt(saltLength);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    return res.send({ status: "success", message: "Password has been successfully reset." });
  } catch (err) {
    return res.status(400).send({ status: "error", message: "Invalid or expired token." });
  }
});

module.exports = router;