var AppError=require("../utils/appError");
var multer=require("multer");
var User=require("./../models/userModel");
var catchAsync=require("./../utils/catchAsync");
var factory=require("./handlerFactory");
var sharp=require("sharp");

// var multerStorage=multer.diskStorage(   // to save the image on disk
//     {
//         destination:(req,file,cb)=>
//         {
//             cb(null,"public/img/users");
//         },
//         filename:(req,file,cb)=>
//         {
//             // user-id-timestamp.jpeg
//             var ext=file.mimetype.split("/")[1];
//             cb(null,`user-${req.user.id}-${Date.now()}.${ext}`); 
//         }
//     }
// );

var multerStorage=multer.memoryStorage();   // storing the image in buffer

var multerFilter=(req,file,cb)=>
{
    if(file.mimetype.startsWith("image"))
    {
        cb(null,true);
    }
    else
    {
        cb(new AppError("Not an image! Please upload only images",400),false);
    }
}

var upload=multer(
    {
        storage:multerStorage,
        fileFilter:multerFilter,
    }
);

exports.uploadUserPhoto=upload.single("photo");

exports.resizeUserPhoto=catchAsync(async(req,res,next)=>
{
    if(!req.file)
    {
        return next();
    }
    req.file.filename=`user-${req.user.id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer).resize(500,500).toFormat("jpeg").jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`);    // as the file is stored in buffer
    next();
});

var filterObj=(obj,...allowedFields)=>
{
    var newObj={};
    Object.keys(obj).forEach((element)=>
    {
        if(allowedFields.includes(element))
        {
            newObj[element]=obj[element];
        }
    });
    return newObj;
}

// exports.getAllUsers=catchAsync(async (req,res,next)=>
// {
//     var users=await User.find();
//     res.status(200).json(
//         {
//             "status":"success",
//             "results":users.length,
//             "data":
//             {
//                 "users":users,
//             }
//         }
//     );
// });

exports.getMe=(req,res,next)=>
{
    req.params.id=req.user.id;
    next();
}

exports.getAllUsers=factory.getAll(User);

exports.updateMe=catchAsync(async (req,res,next)=>
{
    // console.log(req.file); 
    // console.log(req.body);
    // 1. Create error if user POSTs password data
    if(req.body.password||req.body.passwordConfirm)
    {
        return next(new AppError("This route is not for password updates. Please use /updateMyPassword",400));
    }
    // 2. Filtered unwanted field names that aren't allowd to be upated
    var filteredBody=filterObj(req.body,"name","email");
    if(req.file)
    {
        filteredBody.photo=req.file.filename;
    }
    // 3. Update user document
    var updatedUser=await User.findByIdAndUpdate(req.user.id,filteredBody,
        {
            new:true,
            runValidators:true,
        });
    res.status(200).json(
        {
            "status":"success",
            "data":
            {
                "user":updatedUser,
            },
        }
    );
});

exports.deleteMe=catchAsync(async (req,res,next)=>
{
    await User.findByIdAndUpdate(req.user.id,{"active":false});
    res.status(204).json(
        {
            "status":"success",
            "data":null,
        }
    );
});

exports.getUser=factory.getOne(User);
// Do NOT update passwords with this
exports.updateUser=factory.updateOne(User);

exports.deleteUser=factory.deleteOne(User);

exports.createUser=(req,res)=>
{
    res.status(500).json(
        {
            "status":"error",
            "message":"this route is not defined! Please use /signup instead",
        }
    );
}