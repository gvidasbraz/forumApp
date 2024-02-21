const jwt = require('jsonwebtoken');
const resSend = require('../plugins/resSend');
const imageSize = require('image-size');
const axios = require('axios');

require('dotenv').config();

module.exports = {
  validUsername: (req, res, next) => {
    const { username } = req.body;

    if (username.length < 4 || username.length > 20) {
      return resSend(
        res,
        false,
        null,
        'Username must be between 4 and 20 symbols'
      );
    } else if (/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(username)) {
      return resSend(
        res,
        false,
        null,
        'Username must not contain any special characters'
      );
    }

    next();
  },

  validPassword: (req, res, next) => {
    const { password1, password2 } = req.body;

    if (password1.length < 4 || password1.length > 20) {
      return resSend(
        res,
        false,
        null,
        'Password must be between 4 and 20 symbols length'
      );
    } else if (password1 !== password2) {
      return resSend(res, false, null, 'Passwords do not match');
    } else if (!/[A-Z]/.test(password1)) {
      return resSend(
        res,
        false,
        null,
        'Password must contain atleast one uppercase letter'
      );
    } else if (!/[0-9]/.test(password1)) {
      return resSend(
        res,
        false,
        null,
        'Password must contain atleast one number'
      );
    } else if (!/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/.test(password1)) {
      return resSend(
        res,
        false,
        null,
        'Password must contain at least one special character'
      );
    }

    next();
  },
  validToken: (req, res, next) => {
    const token = req.headers.authorization;
    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
      if (error) return resSend(res, false, null, 'Token error');
      req.user = { username: decoded.username };
      next();
    });
  },
  validImageUrl: async (req, res, next) => {
    const { newProfileImage } = req.body;
    if (!newProfileImage) {
      return resSend(res, false, null, 'Image URL is required');
    }
    try {
      const response = await axios.get(newProfileImage, {
        responseType: 'arraybuffer',
      });
      const dimensions = imageSize(Buffer.from(response.data));
      if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0) {
        return resSend(res, false, null, 'Invalid image URL');
      }
      next();
    } catch (error) {
      return resSend(res, false, null, 'Error validating image URL');
    }
  },
};
