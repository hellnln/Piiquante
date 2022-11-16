const User = require('../models/modelsUser');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

exports.createUser = async (req, res) => {
    const foundUser = await User.findOne({email: req.body.email})
    if (foundUser) {
      res.send({message: 'Le compte existe deja'})
    } else {
      bcrypt.hash(req.body.password, 10)
      .then(hash => {
        const newUser = new User({
          email: req.body.email, 
          password: hash
        });
        newUser.save()
          .then(() => res.status(201).json({message: 'Votre compte a bien été créé.'}))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
    }
  };

  exports.loginUser = async (req, res) => {
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
          return res.status(401).json({message:'Votre email ou votre mot de passe est invalide'});
        }
        
    bcrypt.compare(req.body.password, user.password)
      .then(valid => {
        if (!valid) {
          return res.status(401).json({message:'Votre email ou votre mot de passe est invalide'})
        }
        res.status(200).json({
          userId: user._id,
          token: jwt.sign(
            { id: user._id },
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h'}
            )
        });
      })
      .catch(error => res.status(500).json({ 'bcrypt': error }));
    })
    .catch(error => res.status(500).json({ 'mongo1': error }));
  };