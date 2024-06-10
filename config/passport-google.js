require('dotenv').config()
const passport = require('passport')
const User = require('../models/xtreamUsers')
const GoogleStrategy = require('passport-google-oauth20').Strategy

passport.use( new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'https://xtreamleague.onrender.com/auth/google/redirect'

    }, (accessToken, refreshToken, profile, done) => {
       //Check if User exists in the site
       User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {

                return done(null, currentUser)

            }else {
               new User({
                    userName: profile.name.givenName,
                    googleId: profile.id
               }).save().then((newUser) => {
               console.log('new User saved')                  
                return done(null, newUser)

               })
            }

       })

    } 
))

passport.serializeUser((user, done) => {
    if (user) {
        return done(null, user.id)
    }else {
        return done(error, false)
    }
})

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        return done(null, user)
    })
})