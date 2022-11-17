const Sauce = require('../models/modelsSauce');
const fs = require('fs');

// recuperer la liste des sauces
exports.getSauce = (req, res, next) => {
    Sauce.find()  
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
  };

// recuperer les informations d'une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

// creer une nouvelle sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  delete sauceObject._id;
  delete sauceObject.userID;

  const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [],
      usersDisliked: []
  });

  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ 'sauce error': error  }));
  };

// mettre a jour une sauce - _id: req.params.id => on compare l'id de la sauce à l'id de la req, ...req.body => on recupere la sauce de la requete
exports.updateSauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject.userId;

  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
          res.status(401).json({ message: 'Not authorize.'});
      } else {
          const filename = sauce.imageUrl.split('/uploads/')[1];
            fs.unlink(`images/${filename}`, () => {
              Sauce.updateOne({ _id: req.params.id}, {...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
              .catch(error => res.status(400).json({ error }));
        })
      }
    })
    .catch((error) => res.status(400).json({ error }));
  
};

// supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorize'});
      } else {
          const filename = sauce.imageUrl.split('/uploads/')[1];
            fs.unlink(`images/${filename}`, () => {
              Sauce.deleteOne({ _id: req.params.id})
              .then(() => res.status(200).json({ message: 'Sauce supprimée.'}))
              .catch(error => res.status(400).json({ error }));
        })
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// liker une sauce pour un utilisateur donne
exports.likeDislikeSauce = async (req, res, next) => {
  const userId = req.auth.userId;
  const likeStatus = req.body.like;
  const sauceId = req.params.id;
  
  const sauceSelected = await Sauce.findOne({_id: sauceId});
  const userHasDisliked = sauceSelected.usersDisliked.find(e => e == userId);
  const userHasLiked = sauceSelected.usersLiked.find(e => e == userId);
  
  switch (likeStatus) {
    case 1:
                
      if (likeStatus == 1) {
        Sauce.updateOne({_id: sauceId}, {$inc:{likes:1}, $push:{usersLiked: userId}})
        .then(() => res.status(200).json({ message: 'Sauce likée'}))
      }
      
      break;

    case 0:
      if (likeStatus == 0 && userHasLiked != undefined) {
        Sauce.updateOne({_id: sauceSelected._id}, {$inc:{likes: -1}, $pull:{usersLiked: userId}})
        .then(() => res.status(200).json({ message: 'Like retiré !'}))
      }

      if (likeStatus == 0 && userHasDisliked != undefined) {
        Sauce.updateOne({_id: sauceSelected._id}, {$inc:{dislikes: -1}, $pull:{usersDisliked: userId}})
        .then(() => res.status(200).json({ message: 'Dislike retiré !'}))
      }

      break;

    case -1:
      Sauce.findOne({_id: sauceId})
      .then(() => 
        Sauce.updateOne({_id: sauceId}, {$inc:{dislikes:1}, $push:{usersDisliked: userId}})
          .then(() => res.status(200).json({ message: 'Sauce likée'}))
          .catch(error => res.status(400).json({ error }))
          )
      .catch();
      break;
    default:
      res.statut(400).json({ message: 'Invalide value'});
  }
};

