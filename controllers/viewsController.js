var Tour=require("../models/tourModel");
var User=require("../models/userModel");
var AppError=require("../utils/appError");
var catchAsync=require("../utils/catchAsync");
var Booking=require('../models/bookingModel');

exports.getOverview=catchAsync(async (req,res,next)=>
{
    // 1. Get tour data from collection
    var tours=await Tour.find();
    // 2. Build template
    // 3. Render that template using tour data from 1.
    res.status(200).render("overview",
        {
            "title":"All tours",
            "tours":tours,
        }
    );
});

exports.getTour=catchAsync(async (req,res,next)=>
{
    // 1. Get the data, for the requested tour (including reviews and guides)
    var tour=await Tour.findOne({slug:req.params.slug}).populate(
        {
            path:"reviews",
            fields:"review rating user",
        }
    );
    if(!tour)
    {
        return next(new AppError("There is no tour with that name",404));
    }
    res.status(200).render("tour",
        {
            "title":`${tour.name} Tour`,
            "tour":tour,
        }
    );
});

exports.getLoginPage=(req,res)=>
{
    res.status(200).render("login",
        {
            "title":"Log into your account",
            
        }
    );
}

exports.getAccount=(req,res)=>
{
    res.status(200).render("account",
        {
            "title":"Your account",
            
        }
    );
};

exports.getMyTours=catchAsync(async (req,res,next)=>
{
    // 1) Find all bookings
    var bookings=await Booking.find({"user":req.user.id});
    // 2) Find tours with the returned IDs
    var tourIDs=bookings.map((element)=>
        {
            return element.tour
        });
    var tours=await Tour.find(
        {
            _id:
            {
                $in:tourIDs
            }
        }
    );
    res.status(200).render("overview",
    {
        "title":'My Tours',
        "tours":tours,
    });
});

exports.updateUserData=(async (req,res)=>
{
    var updatedUser=await User.findByIdAndUpdate(req.user.id,
        {
            "name":req.body.name,
            "email":req.body.email,
        },
        {
            "new":true,
            "runValidators":true,
        }
    );
    res.status(200).render("account",
        {
            "title":"Your account",
            "user":updatedUser,
        }
    );
})