const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Image = require('../models/image');
const User = require('../models/user');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>{
      Image.find({})
        .populate("author", 'name _id')
        .then(result => {
          User.findOne({ _id: req.user._id })
            .then(userDetails => {
              res.render('dashboard', {
                user: req.user,
                images: result,
                quantity: userDetails.totalItems
              })
            })
            .catch(error => {
              res.send(error.message);
            });
        })
        .catch(error => {
          res.send(error.message);
        });
});

module.exports = router;
