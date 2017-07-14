'use strict';

// load modules
var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var seeder = require('mongoose-seeder');
var bodyParser = require('body-parser');

// models
var Course = require("./models/course");
var User = require("./models/user");
var Review = require("./models/review");

// routes
var userRoutes = require('./routes/users')
var courseRoutes = require('./routes/courses')

// db seed data
var data = require('./data/data.json')

var app = express();

// Configure the Mongo Database
mongoose.connect('mongodb://localhost:27017/course-rating-api')
var db = mongoose.connection;

db.on("error", function (err) {
    console.error("connection error:", err);
});

db.once("open", function () {
    console.log("db connection successful");

    seeder.seed(data).then(function (dbData) {
        console.log("Seeded data");
    }).catch(function (err) {
        console.error(err);
    });
});


// set our port
app.set('port', process.env.PORT || 5000);

// setup body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// morgan gives us http request logging
app.use(morgan('dev'));

// setup our static route to serve files from the "public" folder
app.use('/', express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// catch 404 and forward to global error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
});

// Express's global error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500);

    //  This code was provided by Treehouse and doesn't work
    //  res.render('error', {
    //    message: err.message,
    //    error: {}
    //  });

    res.send({
        message: err.message
    });
});

// start listening on our port
var server = app.listen(app.get('port'), function () {
    console.log('Express server is listening on port ' + server.address().port);
});
