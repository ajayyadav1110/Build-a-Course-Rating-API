"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const uniqueValidator = require('mongoose-unique-validator');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password: {
        type: String,
        required: true
    }
});

UserSchema.statics.authenticate = function (emailAddress, password, callback) {
    User.findOne({
        emailAddress: emailAddress
    }, function (err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            const err = new Error("User not found");
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function (err, result) {
           if (result === true) {
               return callback(null, user);
           } else {
               const err = new Error("Unauthorized")
               err.status = 401;
               return callback(err);
           }
        });
    });
}

UserSchema.pre("save", function (next) {
    const user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
})

UserSchema.plugin(uniqueValidator);

const User = mongoose.model('User', UserSchema);
module.exports = User;
