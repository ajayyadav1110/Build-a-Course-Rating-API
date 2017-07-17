"use strict";

const express = require("express");
const router = express.Router();
const mid = require("../middleware");

// models
const Course = require("../models/course");
const Review = require("../models/review");


router.get("/", function (req, res, next) {
    Course.find({}, '_id title').exec(function(err, courses){
    if(err) return next(err);
    var course = {};
    course.data = courses;
    res.json(course);
    });
});



router.get("/:courseId", function (req, res, next) {
    Course.findById(req.params.courseId).
  populate('user', 'fullName').
    populate({
      path: 'reviews',
      populate: {
        path: 'user',
        select: 'fullName'
      }
    }).exec(function(err, doc){
      if(err) return next(err);

      res.json({
        data: [doc.toJSON({virtuals: true})]
      });
    });
});
router.post("/", mid.getCredentials, function (req, res, next) {
    if (req.user) {
        const course = new Course(req.body);
        course.save(function (err, user) {
            if (err) {
                err.status = 400;
                return next(err);
            }
            res.status(201);
            res.location("/");
            res.send();
        });
    }
});

router.put("/:courseId", mid.getCredentials, function (req, res, next) {
    if (req.user) {
        Course.findById(req.params.courseId, function (err, course) {
            if (err) {
                return next(err);
            }
            if (!course) {
                return next();
            }
            Object.assign(course, req.body);
            course.save(function (err, updatedCourse) {
                if (err) {
                    err.status = 400;
                    return next(err);
                }
                res.status(204);
                res.send();
            });
        });
    }
});

router.post("/:courseId/reviews", mid.getCredentials, function (req, res, next) {
    if (req.user) {
        Course.findById(req.params.courseId, function (err, course) {

            const review = new Review(req.body);
            review.save(function (err, review) {
                if (err) {
                    err.status = 400;
                    return next(err);
                }
                course.reviews.push(review);
                course.save(function (err, course) {
                    if (err) {
                        err.status = 400;
                        return next(err);
                    }
                    res.status(201);
                    res.location("/" + req.params.courseId);
                    res.send();
                });
            });
        });
    }
});



module.exports = router;
