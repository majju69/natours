var express=require("express");
var userController=require("./../controllers/userController");
var authController=require("./../controllers/authController");



var router=express.Router();

router.post("/signup",authController.signup);

router.post("/login",authController.login);

router.get("/logout",authController.logout);

router.post("/forgotPassword",authController.forgotPassword);

router.patch("/resetPassword/:token",authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch("/updateMyPassword",authController.updatePassword);

router.patch("/updateMe",userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);

router.delete("/deleteMe",userController.deleteMe);

router.get("/me",userController.getMe,userController.getUser)

router.use(authController.restrictTo("admin"));

router
    .route("/")
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route("/:id")
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports=router;