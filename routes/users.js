
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
//User model
const User = require('../models/User');

// Login Page
router.get('/login', (req,res)=> res.render('login'));

// Register Page
router.get('/register', (req,res)=> res.render('register'));

// Register Handle
router.post('/register', (req,res)=>{
    const {name,email,password,password2} = req.body;
    let errors = [];

    // Check required fields
    if(!name || !email ||!password ||!password2){
        errors.push({msg: 'Compila tutti i campi'});
    }

    // Check passwrod match
    if(password != password2){
        errors.push({msg:'Password non corrispondenti'});
    }

    // Check passowrd lenght
    if(password.length < 6){
        errors.push({msg:'Password deve essere lunga almeno 6 caratteri'});
    }

    if(errors.length > 0 ){
        // Abbiamo un errore
        res.render('register',{
            errors,
            name,
            email,
            password2
        });
        console.log(errors);
    }else{
        //Validation passed
        User.findOne({ email: email }).then(user => {
            if (user) {
              errors.push({ msg: 'Email già esistente. Effettua il login' });
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2
              });
            } else {
              const newUser = new User({
                name,
                email,
                password
              });
      
              bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                  if (err) throw err;
                  newUser.password = hash;
                  newUser
                    .save()
                    .then(user => {
                      req.flash(
                        'success_msg',
                        'Registrazione effettuata'
                      );
                      res.redirect('/users/login');
                    })
                    .catch(err => console.log(err));
                });
              });
            }
          });
        }
});

// Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
    })(req, res, next);
});

// Logout handle
router.get('/logout', (req,res)=>{
    req.logout();
    req.flash('success_msg','Disconnessione effettuata');
    res.redirect('/users/login');
})
module.exports = router;