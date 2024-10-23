var AppError=require("../utils/appError");

var handleCastErrorDB=(err)=>
{
    var message=`Invalid ${err.path}: ${err.value}`;
    // console.log(`\n\n\n\n\nmessage\n\n\n\n`);
    return new AppError(message,400);
}

var handleDuplicateFieldsDB=(err)=>
{
    var value=err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    // console.log(value);
    var message=`Duplicate field value: ${value}. Please use another value`;
    return new AppError(message,400);
}

var handleValidationErrorDB=(err)=>
{
    var errors=Object.values(err.errors).map((element)=>
    {
        return element.message;
    });
    var message=`Invalid input data. ${errors.join(". ")}`;
    // console.log(message);
    return new AppError(message,400);
}

var handleJWTError=()=>
{
    return new AppError("Invalid token. Please login again",401);
}

var handleJWTExpiredError=()=>
{
    return new AppError("Your token has expired! Please login again",401);
}

var sendErrorDev=(err,req,res)=>
{
    if(req.originalUrl.startsWith("/api"))      // API
    {
        return res.status(err.statusCode).json(
            {
                "status":err.status,
                "error":err,
                "message":err.message,
                "stack":err.stack,
            }
        );
    }
    return res.status(err.statusCode).render("error",
        {
            "title":"Something went wrong!",
            "msg":err.message,
        }
    );
}

var sendErrorProd=(err,req,res)=>
{
    if(req.originalUrl.startsWith("/api"))
    {
        if(err.isOperational)   // Operational, trusted error: send message to client 
        {
            return res.status(err.statusCode).json(
                {
                    "status":err.status,
                    "message":err.message,
                }
            );
        }
        // 1. Log error
        console.error("ERROR 💥",err);
        // 2. Send generic message
        return res.status(500).json(
            {
                "status":"error",
                "message":"Something went very wrong",
            }
        );
    }
    if(err.isOperational)   // Operational, trusted error: send message to client 
    {
        return res.status(err.statusCode).render("error",
            {
                "title":"Something went wrong!",
                "msg":err.message,
            }
        );
    }
    // 1. Log error
    console.error("ERROR 💥",err);
    // 2. Send generic message
    return res.status(err.statusCode).render("error",
        {
            "title":"Something went wrong!",
            "msg":"Please try again later",
        }
    );
    // res.status(err.statusCode).json(
    //     {
    //         "status":err.status,
    //         "message":err.message,
    //     }
    // );
}

module.exports=(err,req,res,next)=>
{
    // console.log(err.stack);
    err.statusCode=err.statusCode||500;
    err.status=err.status||"error";
    if(process.env.NODE_ENV==="development")
    {
        // res.status(err.statusCode).json(
        //     {
        //         "status":err.status,
        //         "error":err,
        //         "message":err.message,
        //         "stack":err.stack,
        //     }
        // );
        sendErrorDev(err,req,res);
    }
    else if(process.env.NODE_ENV==="production")
    {
        // res.status(err.statusCode).json(
        //     {
        //         "status":err.status,
        //         "message":err.message,
        //     }
        // );
        var error={...err};

        // console.log(`\n\n\n\n hello ${error} \n\n\n`);
        // console.log(error.name);
        // console.log("hello");
        var name=err.name;
        var errmsg=err.errmsg;
        error.name=name;
        error.errmsg=errmsg;
        error.message=err.message;
        // console.log(name);
        // console.log(err.name);
        // console.log(error);
        // console.log(err.errmsg);
        if(error.name==="CastError")
        {
            error=handleCastErrorDB(error);
        }
        if(error.code===11000)
        {
            error=handleDuplicateFieldsDB(error);
        }
        if(error.name==="ValidationError")
        {
            error=handleValidationErrorDB(error);  
        }
        if(error.name==="JsonWebTokenError")
        {
            error=handleJWTError();
        }
        if(error.name==="TokenExpiredError")
        {
            error=handleJWTExpiredError();
        }
        sendErrorProd(error,req,res);
    }
    else
    {
        
    }
    // res.status(err.statusCode).json(
    //     {
    //         "status":err.status,
    //         "message":err.message,
    //     }
    // );
}