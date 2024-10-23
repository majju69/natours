var Review=require("../models/reviewModel");
// var catchAsync=require("../utils/catchAsync");
var factory=require("./handlerFactory");


// exports.getAllReviews=catchAsync(async (req,res,next)=>
// {
//     var filter={};
//     if(req.params.tourId)
//     {
//         filter={tour:req.params.tourId};
//     }
//     var reviews=await Review.find(filter);
//     res.status(200).json(
//         {
//             "status":"success",
//             "results":reviews.length,
//             "data":
//             {
//                 "reviews":reviews,
//             }
//         }
//     );
// });

exports.setTourUserIds=(req,res,next)=>
{
    if(!req.body.tour)
    {
        req.body.tour=req.params.tourId;
    }
    if(!req.body.user)
    {
        req.body.user=req.user.id;
    }
    next();
}

// exports.createReview=catchAsync(async (req,res,next)=>
// {
//     // console.log(req.body);
//     // Allow nested routes
//     // if(!req.body.tour)
//     // {
//     //     req.body.tour=req.params.tourId;
//     // }
//     // if(!req.body.user)
//     // {
//     //     req.body.user=req.user.id;
//     // }
//     var newReview=await Review.create(req.body);
//     res.status(201).json(
//         {
//             "status":"success",
//             "data":
//             {
//                 "review":newReview,
//             },
//         }
//     );
// });

exports.createReview=factory.createOne(Review);

exports.updateReview=factory.updateOne(Review);

exports.deleteReview=factory.deleteOne(Review);

exports.getReview=factory.getOne(Review);

exports.getAllReviews=factory.getAll(Review);