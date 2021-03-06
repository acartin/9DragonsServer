const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
// Modificacines cartin
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const _ = require('lodash')
// 


// @desc      Account Activation, Activate account received by email
// @route     POST /api/v1/auth/account-activation
// @access    Public

exports.accountActivation = async (req, res) => {
     const { token } = req.body;
    
    if (!token) {
        return res.status(401).json({
            error: 'No token, authorization denied.'
        });
    } 
    

    try {
        const { name, email, password } = jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION);
       
        //     const { name, email, password } = jwt.decode(token);
        const ability=  [
            {
              action: 'read',
              subject: 'Public'
            }]
            const user = new User({ name, email, password, ability });

            user.save((err, user) => {
                if (err) {
                    console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
                    return res.status(401).json({
                        error: 'Error saving user in database. Try signup again'
                    });
                }
                return res.json({
                    message: 'Signup success. Please signin.'
                });
            });

      } catch(err) {
        var message= 'Something went wrong. Try again.'

        if (err.name === 'TokenExpiredError') {
            message= 'Expired token'
        }

        if (err.name === 'JsonWebTokenError') {
            message= 'Malformed token'
        }

        return res.status(401).json({
            error: message
        });
        
      }
     
};


// @desc      Sign Up, send mail for confirm validation
// @route     POST /api/v1/auth/signup
// @access    Public

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email }).exec() 
      if (user) {
          return res.status(400).json({
              error: 'Email is taken'
          });
      }

      //const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });
      const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn:process.env.JWT_ACCOUNT_ACTIVATION_EXPIRE });

      const emailData = {
          from: process.env.EMAIL_FROM,
          to: email,
          subject: `Account activation link`,
          html: `
              <h1>Please use the following link to activate your account</h1>
              <p>${process.env.CLIENT_URL}/activate/${token}</p>
              <hr />
              <p>This email may contain sensetive information</p>
              <p>${process.env.CLIENT_URL}</p>
          `
      };
      sgMail
          .send(emailData)
          .then(sent => {
              // console.log('SIGNUP EMAIL SENT', sent)
              return res.json({
                  message: `Email has been sent to ${email}. Follow the instruction to activate your account`
              });
          })
          .catch(err => {
              // console.log('SIGNUP EMAIL SENT ERROR', err)
              return res.json({
                  message: err.message
              });
          });
  
  }catch{
    console.log(err);
    return res
            .status(401)
            .json({error: 'Error. Try again.'})

  }
}

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = async (req, res) => {
try {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res
    .status(400)
    .json({error: 'Please provide an email and password'})
}

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res
    .status(401)
    .json({error: 'Invalid credentials'})
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
     return res
            .status(401)
            .json({error: 'Invalid credentials'})
   
  }

  sendTokenResponse(user, 200, res);

} catch (err) {
    console.log(err);
    return res
            .status(401)
            .json({error: 'Error. Try again.'})      
  }
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = async (req, res) => {
  try{
  const { email } = req.body;

  const user = await User.findOne({ email }).exec()
    if (!user) {
        return res.status(400).json({
            error: 'User with that email does not existe'
        });
    }
    // Se manda el email con el token adjunto
    // El user se obtiene del retorno de findOne()
    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

    const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Password Reset link`,
        html: `
            <h1>Please use the following link to reset your password</h1>
            <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>${process.env.CLIENT_URL}</p>
          `
      };

      // ahora se almacena en la bd el token, este paso parece innecesario ya que va adjunto en el mail
        await user.updateOne({ resetPasswordToken: token }, (err, success) => {
        if (err) {
            console.log('RESET PASSWORD LINK ERROR', err);
            return res.status(400).json({
                error: 'Database connection error on user password forgot request'
            });
          } else {
            sgMail
                .send(emailData)
                .then(sent => {
                    // console.log('SIGNUP EMAIL SENT', sent)
                    return res.json({
                         message: `Email has been sent to ${email}. Follow the instruction to activate your account`
                    });
                })
                .catch(err => {
                    // console.log('SIGNUP EMAIL SENT ERROR', err)
                    return res.json({
                      message: err.message
                    })
                })
          }
      })
  
} catch (err) {
    console.log(err);
    return res.status(400).send("Error. Try again.");
  }
};

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public

exports.resetPassword = (req, res) => {
  const { resetPasswordToken, newPassword } = req.body;
  // recordemos que resetPasswordToken es un token y es un campo de la bd
   
  if (resetPasswordToken) {
      //se verifica que no este expirado usando el mismo secret con que se creo
      jwt.verify(resetPasswordToken, process.env.JWT_RESET_PASSWORD, function(err, decoded) {
          if (err) {
              return res.status(400).json({
                  error: 'Expired link. Try again'
              });
          }
      // se busca en la bd por el link
         // console.log(resetPasswordToken)
          User.findOne({ resetPasswordToken }, (err, user) => {
              if (err || !user) {
                  return res.status(400).json({
                      error: 'Something went wrong. Try later'
                  });
              }

              const updatedFields = {
                  password: newPassword,
                  resetPasswordToken: ''
              };

              // es de lodash averiguar que hace extend
              // extiende user con el objeto updateFields
              user = _.extend(user, updatedFields);
              console.log(user)

              user.save((err, result) => {
                  if (err) {
                       return res.status(400).json({
                          error: err
                      });
                  }
                  res.json({
                      message: `Great! Now you can login with your new password`
                  });
              });
          });
      });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const accessToken = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  const { _id, name, email, role, ability} = user;
  res
    .status(statusCode)
    .cookie('token', accessToken, options)
    .json({
      success: true,
      accessToken,
      userData: { _id, name, email, role, ability }
    });
};
