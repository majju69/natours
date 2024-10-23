var crypto=require("crypto");
var jwt=require("jsonwebtoken");
var {promisify}=require("util");
var User=require("../models/userModel");
var catchAsync=require("../utils/catchAsync");
var AppError=require("../utils/appError");
// var sendEmail = require("../utils/email");
// var Tour=require("../models/tourModel");
var Email=require("../utils/email")

var signToken=(id)=>
{
    return jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN});
}

var createSendToken=(user,statusCode,res)=>
{
    var token=signToken(user._id);
    var cookieOption=
    {
        "expires":new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        "httpOnly":true,
    };
    if(process.env.NODE_ENV==="production")
    {
        cookieOption.secure=true;
    }
    res.cookie("jwt",token,cookieOption);
    // Remove the password from the output
    user.password=undefined;
    res.status(statusCode).json(
        {
            "status":"success",
            "token":token,
            "data":
            {
                "user":user,
            },
        }
    );
}

exports.signup=catchAsync(async (req,res,next)=>
{
    var newUser=await User.create(req.body);
    // var newUser=await User.create(
    //     {
    //         "name":req.body.name,
    //         "email":req.body.email,
    //         "password":req.body.password,
    //         "passwordConfirm":req.body.passwordConfirm,
    //         "passwordChangedAt":req.body.passwordChangedAt,
    //         "role":req.body.role,
    //         "passwordResetToken":req.body.passwordResetToken,
    //         "passwordResetExpires":req.body.passwordResetExpires,
    //         "photo":req.body.photo,
    //     }
    // );
    var url=`${req.protocol}://${req.get("host")}/me`;
    console.log(url);
    await new Email(newUser,url).sendWelcome();
    createSendToken(newUser,201,res);
    // var token=signToken(newUser._id);
    // res.status(201).json(
    //     {
    //         "status":"success",
    //         "token":token,
    //         "data":
    //         {
    //             "user":newUser,
    //         },
    //     }
    // );
});

exports.login=catchAsync(async (req,res,next)=>
{
    var {email,password}=req.body;
    // 1. Check if email and password exist
    // console.log(req.body);
    if(!email||!password)
    {
        return next(new AppError("Please provide email and password",400));
    }
    // 2. Check if user exists and the password is correct
    // console.log(email);
    // console.log(password);
    var user=await User
        .findOne({email})
        .select("+password");
    
    if(!user||!(await user.correctPassword(password,user.password)))
    {
        return next(new AppError("Incorrect email or password",401));
    }
    // console.log(user);
    // 3. If everything ok, send token to client
    createSendToken(user,200,res);
    // var token=signToken(user._id);
    // res.status(200).json(
    //     {
    //         "status":"success",
    //         "token":token,
    //     }
    // );
});

exports.logout=(req,res)=>
{
    res.cookie("jwt","loggedout",
        {
            "expires":new Date(Date.now()+10*1000),
            "httpOnly":true,
        }
    );
    res.status(200).json({"status":"success"});
}

exports.protect=catchAsync(async (req,res,next)=>
{
    // 1. Getting token and check if it exists
    var token;
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer"))
    {
        token=req.headers.authorization.split(" ")[1];
    }
    else if(req.cookies.jwt)
    {
        token=req.cookies.jwt;
    }
    // console.log(token);
    if(!token)
    {
        return next(new AppError("You aren't logged in. Please login to get access",401));
    }
    // 2. Verification of the token
    var decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    // console.log(decoded);
    // 3. Check if user still exists
    var currentUser=await User.findById(decoded.id);
    if(!currentUser)
    {
        return next(new AppError("The user belonging to this token no longer exists",401));
    }
    // 4. Check if user changed password after token was issued
    // console.log(val);
    if(currentUser.changedPasswordAfter(decoded.iat))
    {
        return next(new AppError("User recently changed password. Please login again"),401);
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    res.locals.user=currentUser;
    req.user=currentUser;
    next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn=async (req,res,next)=>
{
    if(req.cookies.jwt)
    {
        try
        {
            var token=req.cookies.jwt;
            var decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET);
            var currentUser=await User.findById(decoded.id);
            if(!currentUser)
            {
                return next();
            }
            if(currentUser.changedPasswordAfter(decoded.iat))
            {
                return next();
            }
            res.locals.user=currentUser;
            return next();
        }
        catch(err)
        {
            return next();
        }
    }
    next();
};

exports.restrictTo=(...roles)=>     // roles is an array
{
    return ((req,res,next)=>
    {
        if(!roles.includes(req.user.role))
        {
            return next(new AppError("You do not have the permission to perform this action",403));
        }
        next();
    });
}

exports.forgotPassword=catchAsync(async (req,res,next)=>
{
    // 1. Get user based on POSTed email
    var user=await User.findOne({"email":req.body.email});
    if(!user)
    {
        return next(new AppError("There is no user with that email",404));
    }
    // 2. Generate the random reset token
    var resetToken=user.createPasswordResetToken();
    await user.save({"validateBeforeSave":false});
    // 3. Send it to user's email
    // var message=`Forgot your password ? Submit a PATCH  request with your new password and password confirm to : ${resetURL}.\nIf you did not forget your password, ignore this email!`;
    try 
    {
        var resetURL=`${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
        // console.log("hello");
        // await sendEmail(
        //     {
        //         "email":user.email,
        //         "subject":"Your password reset token (valid for 10 min)",
        //         "message":message,
        //     }
        // );
        await new Email(user,resetURL).sendPasswordReset();
        res.status(200).json(
            {
                "status":"success",
                "message":"Token sent to email",
            }
        );
    } 
    catch(err) 
    {
        user.passwordResetToken=undefined;
        user.passwordResetExpires=undefined;
        await user.save({"validateBeforeSave":false});
        return next(new AppError("There was an error sending the email. Try again later",500));
    }
});

exports.resetPassword=catchAsync(async (req,res,next)=>
{
    // 1. Get user based on the token
    var hashedToken=crypto.createHash("sha256").update(req.params.token).digest("hex");
    var user=await User.findOne({passwordResetToken:hashedToken,passwordResetExpires:{$gt:Date.now()}});
    // 2. If token has not expired, and there is a user, set a new password
    if(!user)
    {
        return next(new AppError("Token is invalid or expired",400));
    }
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.passwordResetToken=undefined;
    user.passwordResetExpires=undefined;
    await user.save();
    // 3. Update changedPasswordAt property for the current user

    // 4. Log the user in, send JWT
    createSendToken(user,200,res);
    // var token=signToken(user._id);
    // res.status(200).json(
    //     {
    //         "status":"success",
    //         "token":token,
    //     }
    // );
});

exports.updatePassword=catchAsync(async (req,res,next)=>
{
    // 1. Get user from collection
    var user=await User.findById(req.user.id).select("+password");
    // 2. Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent,user.password)))
    {
        return next(new AppError("Your current password is wrong"),401);
    }
    // 3. If so, update password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm
    await user.save();
    // User.findByIdAndUpdate() will NOT work as intended !
    // 4. Log the user in, send JWT
    createSendToken(user,200,res);
});