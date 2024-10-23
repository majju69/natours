class APIFeatures
{
    constructor(query,queryString)
    {
        this.query=query;
        this.queryString=queryString;
    }

    filter()
    {
        var queryObj={...this.queryString};//Makes a copy of req.query. If the {...} isn't used, queryObj will be areference of req.query
        // console.log(`Query : ${req.query}`); 
        var excludedFields=["page","sort","limit","fields"];
        excludedFields.forEach((element)=>
        {
            delete queryObj[element];
        });
        
        // 1B. ADVANCED FILTERING

        var queryString=JSON.stringify(queryObj);
        // console.log(`Query string : ${queryString}`);
        queryString=queryString.replace(/\b(gte|gt|lte|lt)\b/g,(match)=>
        {
            return `$${match}`;
        });
        // var query=Tour.find(JSON.parse(queryString));
        this.query.find(JSON.parse(queryString));
        return this;
    }

    sort()
    {
        if(this.queryString.sort)
        {
            var sortBy=this.queryString.sort.split(",").join(" ");
            // console.log(sortBy);
            this.query=this.query.sort(sortBy);
            //sort("price ratingsAverage")
        }
        else
        {
            // console.log(`Else block executed`);
            // query=query.sort("-createdAt");    Doesn't work for some reason
            this.query=this.query.sort("-price");
        }
        return this;
    }

    limitFields()
    {
        if(this.queryString.fields)
        {
            var fields=this.queryString.fields.split(",").join(" ");
            this.query=this.query.select(fields);  // Projecting
        }
        else
        {
            this.query=this.query.select("-__v");
        }
        return this;
    }

    paginate()
    {
        var page=this.queryString.page*1||1;
        var limit=this.queryString.limit*1||100;
        var skip=(page-1)*limit;
        // console.log((page-1)*limit);
        // console.log(`page:${page}`);
        // console.log(`limit:${limit}`);
        // page=2&limit=10  1-10 are for page 1, 11-20 are for page 2, 21-30 are for page 3...
        // console.log(`Before : ${query}`);
        this.query=this.query.skip(skip).limit(limit);
        // console.log(`After : ${query}`);
        // if(this.queryString.page)
        // {
        //     var numTours=await Tour.countDocuments();
        //     // console.log(`numTours:${numTours}`);
        //     // console.log(`skip:${skip}`);
        //     if(numTours<=skip)
        //     {
        //         throw new Error("This page does not exist");
        //     }
        // }
        return this;
    }

}

module.exports=APIFeatures;