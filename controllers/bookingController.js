var Tour=require("./../models/tourModel");
var stripe=require("stripe")(process.env.STRIPE_SECRET_KEY);
var catchAsync=require("./../utils/catchAsync");
var AppError = require("../utils/appError");
var factory=require("./handlerFactory");
var Booking=require("../models/bookingModel")

exports.getCheckoutSession=catchAsync(async(req,res,next)=>
{
    // 1. Get current booked tour
    var tour=await Tour.findById(req.params.tourId);
    // console.log(req.params);
    // console.log(tour);
    // console.log(req.url);
    // 2. Create checkout session
    var session=await stripe.checkout.sessions.create(
        {
            mode:"payment",
            ui_mode:"payment",
            payment_method_types:["card"],
            success_url:`${req.protocol}://${req.get("host")}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
            cancel_url:`${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
            customer_email:req.user.email,
            client_reference_id:req.params.tourId,
            // line_items:
            // [
            //     {
            //         name:`${tour.name} Tour`,    //
            //         description:tour.summary,
            //         images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
            //         amount:tour.price*100,   //
            //         currency:"usd",  //
            //         quantity:1   //
            //     }
            // ],
            line_items: 
            [
                {
                    price_data: 
                    {
                        currency: 'usd',
                        product_data: 
                        {
                            name:`${tour.name} Tour`,
                            description:tour.summary,
                            images:[`https://www.natours.dev/img/tours/${tour.imageCover}`],
                        },
                        unit_amount:tour.price*100,
                    },
                    quantity: 1,
                }
            ],
        }
    )
    // 3. Create session as response
    res.status(200).json(
        {
            "status":"success",
            session,
        }
    );
});

exports.createBookingCheckout=catchAsync(async (req, res, next) =>
{
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    var {tour,user,price}=req.query; 
    if(!tour&&!user&&!price)
    {
        return next();
    }
    await Booking.create({tour,user,price});
    res.redirect(req.originalUrl.split('?')[0]);
});
  
exports.createBooking=factory.createOne(Booking);
exports.getBooking=factory.getOne(Booking);
exports.getAllBookings=factory.getAll(Booking);
exports.updateBooking=factory.updateOne(Booking);
exports.deleteBooking=factory.deleteOne(Booking);