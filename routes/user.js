const express = require('express');
const router = express.Router();

// import controller
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { read, update } = require('../controllers/user');

router.get('/user/:id',requireSignin, read);
//estos son middelewares, primero se requiere que este firmado, 
//luego sigue que sea admin y por ultimo se alcanza el update
//por eso es que en su definicion se usa next()
router.put('/user/update',requireSignin, update);
router.put('/admin/update',requireSignin, adminMiddleware, update);


module.exports = router;