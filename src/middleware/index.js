"use strict";

const basicAuth = require("basic-auth");

const User = require("../models/user");

function getCredentials(req, res, next) {
    const auth = basicAuth(req);

    if (auth && auth.name && auth.pass) {
        const emailAddress = auth.name;
        const password = auth.pass;

        User.authenticate(emailAddress, password, function (err, user) {
            if (err) {
                return next(err);
            } else {
                req.user = user;
                return next();
            }
        });
    } else {
        const err = new Error("Unauthorized");
        err.status = 401;
        return next(err);
    }
}

module.exports.getCredentials = getCredentials;
