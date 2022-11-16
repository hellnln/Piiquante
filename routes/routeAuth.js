const express = require('express');
const userCtrl = require('../controller/UserCtrl');

const router = express.Router();

// creation d'un compte utilisateur
router.post('/signup', userCtrl.createUser );
  
// authentification d'un utilisateur
router.post('/login', userCtrl.loginUser);

module.exports = router;