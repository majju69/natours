var mongoose=require("mongoose");
var slugify=require("slugify");
const router = require("../routes/reviewRoutes");
// var User=require("./userModel");
// var validator=require('validator');

var tourSchema=new mongoose.Schema(
    {
        "name":
        {
            "type":String,
            "required":[true,"A tour must have a name"],
            "unique":true,
            "trim":true,
            "maxlength":[40,"A tour name must have less or equal than 40 charecters"],
            "minlength":[10,"A tour name must have more or equal than 10 charecters"],
            // "validate":[validator.isAlpha,"Tour name must only contain characters"]
        },
        "slug":
        {
            "type":String,
        },
        "duration":
        {
            "type":Number,
            "required":[true,"A tour must have a duration"],
        },
        "maxGroupSize":
        {
            "type":Number,
            "required":[true,"A tour must have group size"],
        },
        "difficulty":
        {
            "type":String,
            "required":[true,"A tour must have a difficulty"],
            "enum":
            {
                "values":["easy","medium","difficult"],
                "message":"Difficulty is either easy or medium or difficult",
            },
        },
        "ratingsAverage":
        {
            "type":Number,
            "default":4.5,
            "min":[1,"Rating must be greater than or equal to 1.0"],
            "max":[5,"Rating must be less than or equal to 5.0"],
            "set":(val)=>
            {
                return Math.round(val*10)/10;
            },
        },
        "ratingsQuantity":
        {
            "type":Number,
            "default":0,
        },
        "price":
        {
            "type":Number,
            "required":[true,"A tour must have a price"],
        },
        "priceDiscount":
        {
            "type":Number,
            "validate":
            {
                "validator":function(val)
                {
                    // this only points to current doc on NEW document creation
                    return this.price>val;
                },
                "message":"Discount price ({VALUE}) should be below regular price",
            }
        },
        "summary":
        {
            "type":String,
            "trim":true,
            "required":[true,"A tour must have a summary"],
        },
        "description":
        {
            "type":String,
            "trim":true,
        },
        "imageCover":
        {
            "type":String,
            "required":[true,"A tour must have a cover image"],
        },
        "images":
        {
            "type":[String],
        },
        "createdAt":
        {
            "type":Date,
            "default":Date.now(),
            "select":false,
        },
        "startDates":
        {
            "type":[Date],
        },
        "secretTour":
        {
            "type":Boolean,
            "default":false,
        },
        "startLocation":
        {
            // GeoJSON
            "type":
            {
                "type":String,
                "default":"Point",
                "enum":["Point"],
            },
            "coordinates":
            {
                "type":[Number],
            },
            "address":
            {
                "type":String,
            },
            "description":
            {
                "type":String,
            },
        },
        "locations":
        [
            {
                "type":
                {
                    "type":String,
                    "default":"Point",
                    "enum":["Point"],
                },
                "coordinates":
                {
                    "type":[Number],
                },
                "address":
                {
                    "type":String,
                },
                "description":
                {
                    "type":String,
                },
                "day":
                {
                    "type":Number,
                },
            }
        ],
        "guides":
        [
            {
                "type":mongoose.Schema.ObjectId,
                "ref":"User",
            }
        ],
    },
    {
        toJSON:
        {
            virtuals:true,
        },
        toObject:
        {
            virtuals:true,
        },
    });

tourSchema.virtual("durationWeeks").get(function()
{
    return this.duration/7;
});

// tourSchema.index({price:1});

tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:"2dsphere"});   // For GEO spatial queries
 
// Virtual populate
tourSchema.virtual("reviews",
    {
        "ref":"Review",
        "foreignField":"tour",
        "localField":"_id",
    }
);

// DOCUMENT MIDDLEWARE : runs before the .save() command and the .create() command

tourSchema.pre("save",function(next)
{
    this.slug=slugify(this.name,{lower:true});
    next();
});

// tourSchema.pre("save",async function(next)
// {
//     var guidesPromises=this.guides.map(async (id)=>
//     {
//         return await User.findById(id)
//     });
//     this.guides=await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.pre("save",function(next)
// {
//     console.log("\nWill save document\n");
//     next();
// });

// tourSchema.post("save",function(doc,next)
// {
//     console.log(doc);
//     next();
// });

// QUERY MIDDLEWARE

// tourSchema.pre("find",function(next)
tourSchema.pre(/^find/,function(next)
{
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
});

tourSchema.post(/^find/,function(docs,next)
{
    console.log(`\nQuery took ${Date.now()-this.start} milliseconds\n`);
    // console.log(docs);
    next();
});

// tourSchema.pre("findOne",function(next)
// {
//     this
//         .find({secretTour:{$ne:true}});
//     next();
// });

tourSchema.pre(/^find/,function(next)
{
    this.populate(
    {
        "path":"guides",
        "select":"-__v -passwordChangedAt",
    });
    next();
});

// AGGREGATION MIDDLEWARE

// tourSchema.pre("aggregate",function(next)
// {
//     this.pipeline().unshift(
//         {
//             $match:
//             {
//                 secretTour:{$ne:true}
//             }
//         }
//     );
//     console.log(this.pipeline());
//     next();
// });

var Tour=mongoose.model("Tour",tourSchema);

module.exports=Tour;