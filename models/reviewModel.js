var mongoose=require("mongoose");
var Tour=require("./tourModel");

var reviewSchema=new mongoose.Schema(
    {
        "review":
        {
            "type":String,
            "required":[true,"Review can't be empty!"],
        },
        "rating":
        {
            "type":Number,
            "min":1,
            "max":5,
        },
        "createdAt":
        {
            "type":Date,
            "default":Date.now(),
        },
        "user":
        {
            "type":mongoose.Schema.ObjectId,
            "ref":"User",
            "required":[true,"Review must belong to a user"],
        },
        "tour":
        {
            "type":mongoose.Schema.ObjectId,
            "ref":"Tour",
            "required":[true,"Review must belong to a tour"],
        },
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/,function(next)
{
    // this
    // .populate(
    // {
    //     "path":"tour",
    //     "select":"name",
    // })
    // .populate(
    // {
    //     "path":"user",
    //     "select":"name photo",
    // });
    this.populate(
        {
            "path":"user",
            "select":"name photo",
        });
    next();
});

reviewSchema.statics.calcAverageRatings=async function(tourId)
{
    console.log(tourId);
    var stats=await this.aggregate(
        [
            {
                $match:
                {
                    tour:tourId,
                }
            },
            {
                $group:
                {
                    _id:"$tour",
                    nRating:{$sum:1},
                    avgRating:{$avg:"$rating"}
                }
            }
        ]
    );
    // console.log(stats);
    if(stats.length>0)
    {
        await Tour.findByIdAndUpdate(tourId,
            {
                ratingsQuantity:stats[0].nRating,
                ratingsAverage:stats[0].avgRating
            }
        );
    }
    else
    {
        await Tour.findByIdAndUpdate(tourId,
            {
                ratingsQuantity:0,
                ratingsAverage:4.5
            }
        );
    }
}

reviewSchema.post("save",function()
{
    // this points to current review
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/,async function(next)
{
    this.r=await this.clone().findOne();    // In the course, clone() isn't used
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/,async function()
{
    // this.r=await this.findOne(); does NOT work here, the query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

var Review=mongoose.model("Review",reviewSchema);

module.exports=Review;
