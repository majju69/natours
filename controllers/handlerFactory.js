var catchAsync=require("./../utils/catchAsync");
var AppError=require("./../utils/appError");
var APIFeatures=require("./../utils/apiFeatures");

exports.deleteOne=(Model)=>
{
    return catchAsync(async(req,res,next)=>
    {
        var doc=await Model.findByIdAndDelete(req.params.id);
        if(!doc)
        {
            return next(new AppError("No document found with that ID",404));
        }
        res.status(204).json(
            {
                "status":"success",
                "data":null,
            }
        );
    });
}

exports.updateOne=(Model)=>
{
    return catchAsync(async(req,res,next)=>
    {
        var doc=await Model.findByIdAndUpdate(req.params.id,req.body,
        {
            "new":true,
            "runValidators":true,
        });
        if(!doc)
        {
            return next(new AppError("No document found with that ID",404));
        }
        res.status(200).json(
            {
                "status":"success",
                "data":
                {
                    "data":doc,
                },
            }
        );
    });
}

exports.createOne=(Model)=>
{
    return catchAsync(async(req,res,next)=>
    {
        var doc=await Model.create(req.body);
        res.status(201).json(
            {
                "status":"success",
                "data":
                {
                    "data":doc,
                },
            }
        );
    });
}

exports.getOne=(Model,popOptions)=>
{
    return catchAsync(async(req,res,next)=>
    {
        var query=Model.findById(req.params.id);
        if(popOptions)
        {
            query=query.populate(popOptions);
        }
        var doc=await query;
        if(!doc)
        {
            return next(new AppError("No document found with that ID",404));
        }
        res.status(200).json(
            {
                "status":"success",
                "data":
                {
                    "data":doc,
                },
            }
        );
    });
}

exports.getAll=(Model)=>
{
    return catchAsync(async(req,res,next)=>
    {
        // To allow for nested GET reviews on tour (hack)
        var filter={};
        if(req.params.tourId)
        {
            filter={tour:req.params.tourId};
        }
        var features=new APIFeatures(Model.find(filter),req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // var doc=await features.query.explain();
        var doc=await features.query;
        res.status(200).json(
            {
                "status":"success",
                "results":doc.length,
                "data":
                {
                    "data":doc,
                }
            }
        );
    });
}


// exports.createTour=catchAsync(async(req,res,next)=>
// {
//     var newTour=await Tour.create(req.body);
//     res.status(201).json(
//         {
//             "status":"success",
//             "data":
//             {
//                 "tour":newTour,
//             },
//         }
//     );
// });

// exports.updateTour=catchAsync(async(req,res,next)=>
// {
//     var tour=await Tour.findByIdAndUpdate(req.params.id,req.body,
//         {
//             "new":true,
//             "runValidators":true,
//         });
//     if(!tour)
//     {
//         return next(new AppError("No tour found with that ID",404));
//     }
//     res.status(200).json(
//         {
//             "status":"success",
//             "tour":tour,
//         }
//     );
// });

// exports.deleteTour=catchAsync(async(req,res,next)=>
// {
//     var tour=await Tour.findByIdAndDelete(req.params.id);
//     if(!tour)
//     {
//         return next(new AppError("No tour found with that ID",404));
//     }
//     res.status(204).json(
//         {
//             "status":"success",
//             "data":null,
//         }
//     );
// });
