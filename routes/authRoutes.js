const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

const authController = require('../controllers/Auth/authController');
const {
  registerValidation,
  loginValidation,
  verifyOtpValidation
} = require('../validators/authValidator');


router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.loginUser);
router.post('/verify-otp', verifyOtpValidation, authController.verifyOtp);
router.post('/logout',authMiddleware,authController.logoutUser);

module.exports = router;
