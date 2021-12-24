const express = require('express');
const {
  accountActivation,
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword  
} = require('../controllers/auth');

//import validators
const {userSignupValidator,userSigninValidator, forgotPasswordValidator, resetPasswordValidator} = require('../validators/auth')
const {runValidation} = require('../validators')


const router = express.Router();

const { protect } = require('../middleware/auth');

//router.post('/signup', signup);
router.post('/account-activation',accountActivation);
router.post('/signup',userSignupValidator,runValidation, signup);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPasswordValidator,runValidation, forgotPassword);
router.put('/resetpassword',resetPassword );

module.exports = router;
