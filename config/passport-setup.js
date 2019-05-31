const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const  LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../models/google-model');
const regist = require('../models/users-model');
// const User = require('../models/user-model');
const keys = require('./keys');

passport.serializeUser((user,done)=>{
    done(null,user.id);

})

passport.deserializeUser((id,done)=>{
    User.findById(id).then((user) =>{
        done(null,user);
    })

});

passport.use(new GoogleStrategy({
    callbackURL: '/auth/google/redirect',
    clientID: keys.google.clientID,
    clientSecret: keys.google.clientSecret
}, (accessToken, refreshToken, profile, done) =>{
    User.findOne({googleId: profile.id}).then((currentUser) =>{
        if(currentUser){
            console.log('user is:' + currentUser);
            done(null, currentUser);
        } else{
            new User({
                username: profile.displayName,
                googleId: profile.id
            }).save().then((newUser) =>{
                console.log('new user created:' + newUser);
                done(null, newUser);
            });
        }
    })
}));

module.exports = function(passport){
    passport.use(new LocalStrategy(function(username,password,done){
            // local Strategy
            let query = {username:username};
            regist.findOne(query, function(err, user){
                if(err) throw err;
                if(!user){
                    return done(null, false, {message: 'No user found'});
                }
            
                // match Password
                bcrypt.compare(password,user.password, function(err,isMatch){
                    if(err) throw err;
                    if(isMatch){
                        return done(null, user);
                    }else{
                    return done(null, false, {message: 'Wrong Password'});
            
                    }
                })
            })
    }))
        passport.serializeUser(function(user, done){
            done(null,user.id);
        });
        passport.deserializeUser(function(id,done){
            regist.findById(id, function(err, user) {
                done(err, user);
            });
        });
    }
