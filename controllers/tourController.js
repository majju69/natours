// Try to debug the pagination part

// var APIFeatures=require("./../utils/apiFeatures");

// var fs=require("fs");
var sharp=require("sharp");
var multer=require("multer");
var Tour=require("./../models/tourModel");

var catchAsync=require("./../utils/catchAsync");
var AppError = require("../utils/appError");
var factory=require("./handlerFactory");

var multerStorage=multer.memoryStorage();   // storing the images in buffer

var multerFilter=(req,file,cb)=>
{
    // console.log("HELLO");
    if(file.mimetype.startsWith("image"))
    {
        // console.log("Hello");
        // console.log(file);
        cb(null,true);
    }
    else
    {
        // console.log("error");
        cb(new AppError("Not an image! Please upload only images",400),false);
    }
}

var upload=multer(
    {
        storage:multerStorage,
        fileFilter:multerFilter,
    }
);

exports.uploadTourImages=upload.fields(
    [
        {
            name:"imageCover",
            maxCount:1,
        },
        {
            name:"images",
            maxCount:3,
        },
    ]
);

/*
upload.single("image")      for single
upload.array("images",5)    for multiple
upload.fields()         for mix
*/

exports.resizeTourImages=catchAsync(async (req,res,next)=>
{
    // console.log(req.files);
    // console.log("hello");
    // console.log(req);
    if(!req.files.imageCover||!req.files.images)
    {
        return next();
    }
    // 1. Cover image
    req.body.imageCover=`tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat("jpeg").jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`);
    // 2. Images
    req.body.images=[];
    await Promise.all(req.files.images.map(async (file,i)=>
    {
        var filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`;
        await sharp(file.buffer).resize(2000,1333).toFormat("jpeg").jpeg({quality:90}).toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }));
    console.log(req.body);
    next();
});

exports.aliasTopTours=(req,res,next)=>
{
    req.query.limit="5";
    req.query.sort="-ratingsAverage,price";
    req.query.fields="name,price,ratingsAverage,summary,difficulty";
    next();
} 

// var tours=JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`,"utf-8"));

// exports.checkBody=(req,res,next)=>
// {
//     if(!req.body.name||!req.body.price)
//     {
//         return res.status(400).json(
//             {
//                 "status":"fail",
//                 "message":"Bad request",
//             }
//         );
//     }
//     next();
// }

// exports.checkID=(req,res,next,val)=>
// {
//     console.log(`\nThe id is ${val}\n`);
//     if(val>=tours.length)
//     {
//         return res.status(404).json(
//             {
//                 "status":"failed",
//                 "message":"Invalid ID",
//             }
//         );
//     }
//     next();
// }

/**{
    "status": "success",
    "results": 9,
    "data": {
        "tours": [
            {
                "_id": "6700d50ae1d41952f59a27f3",
                "name": "The Forest Hiker"
            },
            {
                "_id": "6700d50ae1d41952f59a27f6",
                "name": "The City Wanderer"
            },
            {
                "_id": "6700d50ae1d41952f59a27f7",
                "name": "The Park Camper" 
            },
            {
                "_id": "6700d50ae1d41952f59a27f8",
                "name": "The Sports Lover"
            },
            {
                "_id": "6700d50ae1d41952f59a27f9",
                "name": "The Wine Taster"
            },
            {
                "_id": "6700d50ae1d41952f59a27f4",
                "name": "The Sea Explorer"
            },
            {
                "_id": "6700d50ae1d41952f59a27f5",
                "name": "The Snow Adventurer" 
            },
            {
                "_id": "6700d50ae1d41952f59a27fa",
                "name": "The Star Gazer"
            },
            {
                "_id": "6700d50ae1d41952f59a27fb",
                "name": "The Northern Lights"
            }
        ]
    }
}**/

// class APIFeatures
// {
//     constructor(query,queryString)
//     {
//         this.query=query;
//         this.queryString=queryString;
//     }

//     filter()
//     {
//         var queryObj={...this.queryString};//Makes a copy of req.query. If the {...} isn't used, queryObj will be areference of req.query
//         // console.log(`Query : ${req.query}`); 
//         var excludedFields=["page","sort","limit","fields"];
//         excludedFields.forEach((element)=>
//         {
//             delete queryObj[element];
//         });
        
//         // 1B. ADVANCED FILTERING

//         var queryString=JSON.stringify(queryObj);
//         // console.log(`Query string : ${queryString}`);
//         queryString=queryString.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>
//         {
//             return `$${match}`;
//         });
//         // var query=Tour.find(JSON.parse(queryString));
//         this.query.find(JSON.parse(queryString));
//         return this;
//     }

//     sort()
//     {
//         if(this.queryString.sort)
//         {
//             var sortBy=this.queryString.sort.split(",").join(" ");
//             // console.log(sortBy);
//             this.query=this.query.sort(sortBy);
//             //sort("price ratingsAverage")
//         }
//         else
//         {
//             // console.log(`Else block executed`);
//             // query=query.sort("-createdAt");    Doesn't work for some reason
//             this.query=this.query.sort("-price");
//         }
//         return this;
//     }

//     limitFields()
//     {
//         if(this.queryString.fields)
//         {
//             var fields=this.queryString.fields.split(",").join(" ");
//             this.query=this.query.select(fields);  // Projecting
//         }
//         else
//         {
//             this.query=this.query.select("-__v");
//         }
//         return this;
//     }

//     paginate()
//     {
//         var page=this.queryString.page*1||1;
//         var limit=this.queryString.limit*1||100;
//         var skip=(page-1)*limit;
//         // console.log((page-1)*limit);
//         // console.log(`page:${page}`);
//         // console.log(`limit:${limit}`);
//         // page=2&limit=10  1-10 are for page 1, 11-20 are for page 2, 21-30 are for page 3...
//         // console.log(`Before : ${query}`);
//         this.query=this.query.skip(skip).limit(limit);
//         // console.log(`After : ${query}`);
//         // if(this.queryString.page)
//         // {
//         //     var numTours=await Tour.countDocuments();
//         //     // console.log(`numTours:${numTours}`);
//         //     // console.log(`skip:${skip}`);
//         //     if(numTours<=skip)
//         //     {
//         //         throw new Error("This page does not exist");
//         //     }
//         // }
//         return this;
//     }

// }

// exports.getAllTours=catchAsync(async(req,res,next)=>
// {
//     // console.log(req.customParam);
//     // try
//     // {
//     //     // console.log(req.query,queryObj);
//     //     /*************BUILD QUERY*****************/
//     //     // 1A. FILTERING

//     //     // var queryObj={...req.query};//Makes a copy of req.query. If the {...} isn't used, queryObj will be areference of req.query
//     //     // // console.log(`Query : ${req.query}`); 
//     //     // var excludedFields=["page","sort","limit","fields"];
//     //     // excludedFields.forEach((element)=>
//     //     //     {
//     //     //         delete queryObj[element];
//     //     //     });
        
//     //     // // 1B. ADVANCED FILTERING

//     //     // var queryString=JSON.stringify(queryObj);
//     //     // // console.log(`Query string : ${queryString}`);
//     //     // queryString=queryString.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>
//     //     //     {
//     //     //         return `$${match}`;
//     //     //     });
//     //     // console.log(JSON.parse(queryString));
//     //     // {"difficulty":"easy","duration":{$gte:5}}
//     //     // {"difficulty":"easy","duration":{gte:5}}
//     //     // gte,gt,lt,lte

//     //     // var query=Tour.find(JSON.parse(queryString));
//     //     // console.log(`Even before : ${query}`);

//     //     // 2. SORTING
        
//     //     // if(req.query.sort)
//     //     // {
//     //     //     var sortBy=req.query.sort.split(",").join(" ");
//     //     //     // console.log(sortBy);
//     //     //     query=query.sort(sortBy);
//     //     //     //sort("price ratingsAverage")
//     //     // }
//     //     // else
//     //     // {
//     //     //     // console.log(`Else block executed`);
//     //     //     // query=query.sort("-createdAt");    Doesn't work for some reason
//     //     //     query=query.sort("-price");
//     //     // }

//     //     // 3. FIELD LIMITING

//     //     // if(req.query.fields)
//     //     // {
//     //     //     var fields=req.query.fields.split(",").join(" ");
//     //     //     query=query.select(fields);  // Projecting
//     //     // }
//     //     // else
//     //     // {
//     //     //     query=query.select("-__v");
//     //     // }

//     //     // 4. PAGINATION

//     //     // console.log(req.query.page); 
//     //     // console.log(req.query.page);
//     //     // console.log(req.query.limit);
//     //     // console.log(req.query);     //
//     //     // var page=req.query.page*1||1;
//     //     // var limit=req.query.limit*1||100;
//     //     // var skip=(page-1)*limit;
//     //     // // console.log((page-1)*limit);
//     //     // // console.log(`page:${page}`);
//     //     // // console.log(`limit:${limit}`);
//     //     // // page=2&limit=10  1-10 are for page 1, 11-20 are for page 2, 21-30 are for page 3...
//     //     // // console.log(`Before : ${query}`);
//     //     // query=query.skip(skip).limit(limit);
//     //     // // console.log(`After : ${query}`);
//     //     // if(req.query.page)
//     //     // {
//     //     //     var numTours=await Tour.countDocuments();
//     //     //     // console.log(`numTours:${numTours}`);
//     //     //     // console.log(`skip:${skip}`);
//     //     //     if(numTours<=skip)
//     //     //     {
//     //     //         throw new Error("This page does not exist");
//     //     //     }
//     //     // }

//     //     /*************EXECUTE QUERY***************/
//     //     var features=new APIFeatures(Tour.find(),req.query)
//     //         .filter()
//     //         .sort()
//     //         .limitFields()
//     //         .paginate();
//     //     var tours=await features.query;
//     //     // var query=Tour.find()
//     //     //     .where("duration").equals(req.query.duration)
//     //     //     .where("difficulty").equals(req.query.difficulty);
//     //     /***********SEND RESPONSE*************/
//     //     // console.log(tours);
//     //     res.status(200).json(
//     //         {
//     //             "status":"success",
//     //             "results":tours.length,
//     //             "data":
//     //             {
//     //                 "tours":tours,
//     //             }
//     //         }
//     //     );
//     // }
//     // catch(err)
//     // {
//     //     res.status(404).json(
//     //         {
//     //             "status":"fail",
//     //             "message":err,
//     //         }
//     //     );
//     // }
//     var features=new APIFeatures(Tour.find(),req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();
//     var tours=await features.query;
//     res.status(200).json(
//         {
//             "status":"success",
//             "results":tours.length,
//             "data":
//             {
//                 "tours":tours,
//             }
//         }
//     );
// });

exports.getAllTours=factory.getAll(Tour);

// exports.getTour=catchAsync(async(req,res,next)=>
// {
//     // var idx=req.params.id*1;
//     // res.status(200).json(tours[idx]);
//     // try
//     // {
//     //                 // Tour.findOne({_id:req.params.id});
//     //     var tour=await Tour.findById(req.params.id);
//     //     res.status(200).json(
//     //         {
//     //             "status":"success",
//     //             "data":
//     //             {
//     //                 "tour":tour,
//     //             },
//     //         }
//     //     );
//     // }
//     // catch(err)
//     // {
//     //     res.status(404).json(
//     //         {
//     //             "status":"fail",
//     //             "message":err,
//     //         }
//     //     );
//     // }
//     var tour=await Tour.findById(req.params.id).populate("reviews");/*.populate(    Added a middleware for this
//         {
//             "path":"guides",
//             "select":"-__v -passwordChangedAt",
//         })*/;
//     if(!tour)
//     {
//         return next(new AppError("No tour found with that ID",404));
//     }
//     res.status(200).json(
//         {
//             "status":"success",
//             "data":
//             {
//                 "tour":tour,
//             },
//         }
//     );
// });

exports.getTour=factory.getOne(Tour,{path:"reviews"});

// var catchAsync=(fn)=>
// {
//     return (req,res,next)=>
//     {
//         fn(req,res,next).catch((err)=>
//         {
//             next(err);
//         });
//     }
// }

// exports.createTour=catchAsync(async(req,res,next)=>
// {
//     // var id=tours[tours.length-1].id+1;
//     // var newTour=Object.assign(
//     //     {
//     //         "id":id,
//     //     },req.body);
//     // tours.push(newTour);
//     // var data=JSON.stringify(tours);
//     // fs.writeFile(`${__dirname}/dev-data//data/tours-simple.json`,data,(err)=>
//     // {
//     //     if(err)
//     //     {
//     //         throw err;
//     //     }
//     //     else
//     //     {
//     //         res.status(201).json(newTour);
//     //     }
//     // });
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
//     // try
//     // {
//     //     // var newTour=new Tour({});
//     //     // newTour.save();
//     //     var newTour=await Tour.create(req.body);
//     //     res.status(201).json(
//     //         {
//     //             "status":"success",
//     //             "data":
//     //             {
//     //                 "tour":newTour,
//     //             },
//     //         }
//     //     );
//     // }
//     // catch(err)
//     // {
//     //     res.status(400).json(
//     //         {
//     //             "status":"fail",
//     //             "message":err,
//     //         }
//     //     );
//     // }
// });

exports.createTour=factory.createOne(Tour);

// exports.updateTour=catchAsync(async(req,res,next)=>
// {
//     // try
//     // {
//     //     var tour=await Tour.findByIdAndUpdate(req.params.id,req.body,
//     //         {
//     //             "new":true,
//     //             "runValidators":true,
//     //         });
//     //     res.status(200).json(
//     //         {
//     //             "status":"success",
//     //             "tour":tour,
//     //         }
//     //     );
//     // }
//     // catch(err)
//     // {
//     //     res.status(404).json(
//     //         {
//     //             "status":"fail",
//     //             "message":err,
//     //         }
//     //     );
//     // }
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

exports.updateTour=factory.updateOne(Tour);

exports.deleteTour=factory.deleteOne(Tour);

// exports.deleteTour=catchAsync(async(req,res,next)=>
// {
//     // try
//     // {
//     //     await Tour.findByIdAndDelete(req.params.id);
//     //     res.status(204).json(
//     //         {
//     //             "status":"success",
//     //             "data":null,
//     //         }
//     //     );
//     // }
//     // catch(err)
//     // {
//     //     res.status(404).json(
//     //         {
//     //             "status":"fail",
//     //             "message":err,
//     //         }
//     //     );
//     // }
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

exports.getTourStats=(async (req,res,next)=>
{
    // try
    // {
    //     var stats=await Tour.aggregate(
    //         [
    //             {
    //                 $match:
    //                 {
    //                     ratingsAverage:{$gte:4.5}
    //                 }
    //             },
    //             {
    //                 $group:
    //                 {
    //                     _id:{$toUpper:"$difficulty"},
    //                     // _id:"$ratingsAverage",
    //                     // _id:"$difficulty",
    //                     numTours:{$sum:1},
    //                     numRatings:{$sum:"$ratingsQuantity"},
    //                     avgRating:{$avg:"$ratingsAverage"},
    //                     avgPrice:{$avg:"$price"},
    //                     minPrice:{$min:"$price"},
    //                     maxPrice:{$max:"$price"},
    //                 }
    //             },
    //             {
    //                 $sort:
    //                 {
    //                     avgPrice:1
    //                 }
    //             },
    //             // {
    //             //     $match:
    //             //     {
    //             //         _id:{$ne:"EASY"}
    //             //     }
    //             // } 
    //         ]);
    //     res.status(200).json(
    //         {
    //             "status":"success",
    //             "data":
    //             {
    //                 "stats":stats,
    //             },
    //         }
    //     );
    // }
    // catch(err)
    // {
    //     res.status(404).json(
    //         {
    //             "status":"fail",
    //             "message":err,
    //         }
    //     );
    // }
    var stats=await Tour.aggregate(
        [
            {
                $match:
                {
                    ratingsAverage:{$gte:4.5}
                }
            },
            {
                $group:
                {
                    _id:{$toUpper:"$difficulty"},
                    // _id:"$ratingsAverage",
                    // _id:"$difficulty",
                    numTours:{$sum:1},
                    numRatings:{$sum:"$ratingsQuantity"},
                    avgRating:{$avg:"$ratingsAverage"},
                    avgPrice:{$avg:"$price"},
                    minPrice:{$min:"$price"},
                    maxPrice:{$max:"$price"},
                }
            },
            {
                $sort:
                {
                    avgPrice:1
                }
            },
            // {
            //     $match:
            //     {
            //         _id:{$ne:"EASY"}
            //     }
            // } 
        ]);
    res.status(200).json(
        {
            "status":"success",
            "data":
            {
                "stats":stats,
            },
        }
    );
});

exports.getMonthlyPlan=catchAsync(async (req,res,next)=>
{
    // try
    // {
    //     var year=req.params.year*1;
    //     var plan=await Tour.aggregate(
    //         [
    //             {
    //                 $unwind:"$startDates"
    //             },
    //             {
    //                 $match:
    //                 {
    //                     startDates:
    //                     {
    //                         $gte:new Date(`${year}-01-01`),
    //                         $lte:new Date(`${year}-12-31`)
    //                     }
    //                 }
    //             },
    //             {
    //                 $group:
    //                 {
    //                     _id:{$month:"$startDates"},
    //                     numToursStarts:{$sum:1},
    //                     tours:{$push:"$name"}
    //                 }
    //             },
    //             {
    //                 $addFields:{month:"$_id"},
    //             },
    //             {
    //                 $project:{_id:0}
    //             },
    //             {
    //                 $sort:{numToursStarts:-1}
    //             },
    //             {
    //                 $limit:12
    //             }
    //         ]
    //     );
    //     res.status(200).json(
    //         {
    //             "status":"success",
    //             "data":
    //             {
    //                 "plan":plan,
    //             },
    //         }
    //     );
    // }
    // catch(err)
    // {
    //     res.status(404).json(
    //         {
    //             "status":"fail",
    //             "message":err,
    //         }
    //     );
    // }
    var year=req.params.year*1;
    var plan=await Tour.aggregate(
        [
            {
                $unwind:"$startDates"
            },
            {
                $match:
                {
                    startDates:
                    {
                        $gte:new Date(`${year}-01-01`),
                        $lte:new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:
                {
                    _id:{$month:"$startDates"},
                    numToursStarts:{$sum:1},
                    tours:{$push:"$name"}
                }
            },
            {
                $addFields:{month:"$_id"},
            },
            {
                $project:{_id:0}
            },
            {
                $sort:{numToursStarts:-1}
            },
            {
                $limit:12
            }
        ]
    );
    res.status(200).json(
        {
            "status":"success",
            "data":
            {
                "plan":plan,
            },
        }
    );
});

// "/tours-within/:distance/center/:latlng/unit/:unit"
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin=catchAsync(async (req,res,next)=>
{
    var {distance,latlng,unit}=req.params;
    var [lat,lng]=latlng.split(",");
    var radius=unit==="mi"?distance/3963.2:distance/6378.1;
    if(!lat||!lng)
    {
        next(new AppError("Please provide latitude and longitude in the format lat,lng.",400));
    }
    var tours=await Tour.find({startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}}});
    res.status(200).json(
        {
            "status":"success",
            "results":tours.length,
            "data":
            {
                "data":tours,
            },
        }
    );
});

exports.getDistances=catchAsync(async(req,res,next)=>
{
    var {latlng,unit}=req.params;
    var [lat,lng]=latlng.split(",");
    var multiplier=unit==="mi"?0.000621371:0.001;
    if(!lat||!lng)
    {
        next(new AppError("Please provide latitude and longitude in the format lat,lng.",400));
    }
    var distances=await Tour.aggregate(
        [
            {    
                $geoNear:
                {
                    near:
                    {
                        "type":"Point",
                        "coordinates":[lng*1,lat*1],
                    },
                    distanceField:"distance",
                    distanceMultiplier:multiplier,
                }
            },
            {
                $project:
                {
                    distance:1,
                    name:1,
                }
            }
        ]
    );
    res.status(200).json(
        {
            "status":"success",
            "data":
            {
                "data":distances,
            },
        }
    );
});