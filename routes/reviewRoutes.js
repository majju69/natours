var express=require("express");
var reviewController=require("./../controllers/reviewController");
var authController=require("./../controllers/authController")

var router=express.Router({"mergeParams":true});

router.use(authController.protect);

router
    .route("/")
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo("user"),reviewController.setTourUserIds,reviewController.createReview);

router
    .route("/:id")
    .delete(authController.restrictTo("user","admin"),reviewController.deleteReview)
    .patch(authController.restrictTo("user","admin"),reviewController.updateReview)
    .get(reviewController.getReview);

module.exports=router;