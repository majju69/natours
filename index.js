var path=require("path");
var express=require("express");
var morgan=require("morgan");
var rateLimit=require("express-rate-limit");
var helmet=require("helmet");
var mongoSanitize=require("express-mongo-sanitize");
var xss=require("xss-clean");
var hpp=require("hpp");

var tourRouter=require("./routes/tourRoutes");
var userRouter=require("./routes/userRoutes");
var reviewsRouter=require("./routes/reviewRoutes");
var AppError=require("./utils/appError");
var globalErrorHandler=require("./controllers/errorController");
var viewRouter=require("./routes/viewRoutes");
var bookingRouter=require("./routes/bookingRoutes");
var cookieParser=require("cookie-parser");
var bodyParser=require("body-parser");
// const port=3000;
// Start express
var app=express();

app.set("view engine","pug");
app.set("views",path.join(__dirname,"views"));
// app.use(bodyParser.urlencoded({extended:true}));
/**************GLOBAL MIDDLEWARES***************/

// Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,"public")));

// Set security HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV==="development")
{
    app.use(morgan("dev"));
}

// Limit requests from same API
var limiter=rateLimit(
    {
        "max":100,
        "windowMs":60*60*1000,
        "message":"Too many requests from this IP. Please try again in an hour",
    }
);
app.use("/api",limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({"limit":"10kb"}));
app.use(bodyParser.urlencoded({extended:true,limit:"10kb"}));
app.use(cookieParser());

// Data sanitization against noSQL query injections
app.use(mongoSanitize())

// Data sanitization against XSS
app.use(xss());     // This is depricated

// Prevent parameter pollution
app.use(hpp(
    {
        "whitelist":
        [
            "duration",
            "ratingsQuantity",
            "ratingAverage",
            "maxGroupSize",
            "difficulty",
            "price",
        ],
    }
));

// Test middleware
app.use((req,res,next)=>
{
    req.requestTime=new Date().toISOString();
    // console.log(req.headers);
    next();
});

// app.use(                // https://stackoverflow.com/questions/67601708/axios-cdn-link-refused-to-load#:~:text=Refused%20to%20load%20the%20script,is%20used%20as%20a%20fallback.
//     helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: ["'self'", 'data:', 'blob:'],
   
//         fontSrc: ["'self'", 'https:', 'data:'],
  
//         scriptSrc: ["'self'", 'unsafe-inline'],
   
//         scriptSrc: ["'self'", 'https://*.cloudflare.com'],
   
//         scriptSrcElem: ["'self'",'https:', 'https://*.cloudflare.com'],
   
//         // styleSrc: ["'self'", 'https:', 'unsafe-inline'],
   
//         // connectSrc: ["'self'", 'data', 'https://*.cloudflare.com']
//       },
//     })
//   );

// app.get("/",(req,res)=>
// {
//     res.status(200).json(
//         {
//             "message":"Hello",
//             "app":"natours",
//         }
//     );;
// });

// app.post("/",(req,res)=>
// {
//     res.send("You can post");
// });



// app.get("/api/v1/tours",getAllTours);
// app.get("/api/v1/tours/:id",getTour);
// app.post("/api/v1/tours",createTour);
// app.patch("/api/v1/tours/:id",updateTour);
// app.delete("/api/v1/tours/:id",deleteTour);

// app.route("/api/v1/tours").get(getAllTours).post(createTour);
// app.route("/api/v1/tours/:id").get(getTour).patch(updateTour).delete(deleteTour);
// app.route("/api/v1/users").get(getAllUsers).post(createUser);
// app.route("/api/v1/users/:id").get(getUser).patch(updateUser).delete(deleteUser);

/***************ROUTES***************/

app.use("/",viewRouter);
app.use("/api/v1/tours",tourRouter);
app.use("/api/v1/users",userRouter);
app.use("/api/v1/reviews",reviewsRouter);
app.use("/api/v1/bookings",bookingRouter);

app.all("*",(req,res,next)=>
{
    // res.status(404).json(
    //     {
    //         "status":"fail",
    //         "message":`Can't find ${req.originalUrl} on this server `,
    //     }
    // );
    // var err=new Error(`Can't find ${req.originalUrl} on this server `);
    // err.status="fail";
    // err.statusCode=404;
    next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
});

// app.use((err,req,res,next)=>
// {
//     console.log(err.stack);
//     err.statusCode=err.statusCode||500;
//     err.status=err.status||"error";
//     res.status(err.statusCode).json(
//         {
//             "status":err.status,
//             "message":err.message,
//         }
//     );
// });

app.use(globalErrorHandler);

module.exports=app; 

