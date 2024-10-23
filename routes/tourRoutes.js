var express=require("express");
var tourContoller=require("./../controllers/tourController");
var authController=require("./../controllers/authController");
// var reviewController=require("./../controllers/reviewController");
var reviewsRouter=require("./../routes/reviewRoutes")

// app.use(bodyParser.urlencoded({extended:true}));

var router=express.Router();

// router.param("id",tourContoller.checkID);

// POST /tour/tour_id/reviews
// GET /tour/tour_id/reviews
// GET /tour/tour_id/reviews/review_id

// router
//     .route("/:tourId/reviews")
//     .post(authController.protect,authController.restrictTo("user"),reviewController.createReview)

router.use("/:tourId/reviews",reviewsRouter);

router
    .route("/top-5-cheap")
    .get(tourContoller.aliasTopTours,tourContoller.getAllTours);

router
    .route("/monthly-plan/:year")
    .get(authController.protect,authController.restrictTo("admin","lead-guide","guide"),tourContoller.getMonthlyPlan);

router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(tourContoller.getToursWithin);

router
    .route("/tour-stats")
    .get(tourContoller.getTourStats);

router
    .route("/distances/:latlng/unit/:unit")
    .get(tourContoller.getDistances);

router
    .route("/")
    .get(/*authController.protect,*/tourContoller.getAllTours)
    .post(/*tourContoller.checkBody,*/authController.protect,authController.restrictTo("admin","lead-guide"),tourContoller.createTour);

router
    .route("/:id")
    .get(tourContoller.getTour)
    .patch(authController.protect,authController.restrictTo("admin","lead-guide"),tourContoller.uploadTourImages,tourContoller.resizeTourImages,tourContoller.updateTour)
    .delete(authController.protect,authController.restrictTo("admin","lead-guide"),tourContoller.deleteTour);



module.exports=router;