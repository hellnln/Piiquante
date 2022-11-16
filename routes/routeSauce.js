const express = require('express');

const router = express.Router();
const auth = require('../middleware/auth');
const sauceCtrl = require('../controller/sauceCtrl');
const upload = require('../middleware/multer-config');

  
// recuperer la liste des sauces
router.get('/',auth, sauceCtrl.getSauce);

// recuperer les informations d'une sauce
router.get('/:id',auth, sauceCtrl.getOneSauce);

// creer une nouvelle sauce
router.post('/',auth, upload, sauceCtrl.createSauce);

// mettre a jour une sauce
router.put('/:id',auth, upload, sauceCtrl.updateSauce);

// supprimer une sauce
router.delete('/:id',auth, sauceCtrl.deleteSauce);

// liker/disliker une sauce pour un utilisateur donne
router.post('/:id/like',auth, sauceCtrl.likeDislikeSauce);

module.exports = router;