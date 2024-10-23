var crypto=require("crypto");
var mongoose=require("mongoose");
var validator=require("validator");
var bcrypt=require("bcryptjs");

var userSchema=new mongoose.Schema(
    {
        "name":
        {
            "type":String,
            "required":[true,"Please tell us your name!"],
            // "validate":[validator.isAlpha,"User's name must only contain characters"],
        },
        "email":
        {
            "type":String,
            "required":[true,"Please provide youyr email"],
            "unique":true,
            "lowercase":true,
            "validate":[validator.isEmail,"Please provide a valid email"],
        },
        "photo":
        {
            "type":String,
            "default":"default.jpg",
        },
        "password":
        {
            "type":String,
            "required":[true,"Please provide a password"],
            "minLength":8,
            "select":false,
        },
        "passwordConfirm":
        {
            "type":String,
            "required":[true,"Please confirm your password"],
            "validate":
            {
                "validator":function(element)       // This only works on SAVE ie on .create() or .save()!!!
                {
                    return this.password===element;
                },
                "message":"Passwords aren't the same",
            },
        },
        "passwordChangedAt":
        {
            "type":Date,
            // "default":Date.now(),
            // "required":true,
        },
        "role":
        {
            "type":String,
            "enum":["user","guide","lead-guide","admin"],
            "default":"user",
        },
        "passwordResetToken":
        {
            "type":String,
        },
        "passwordResetExpires":
        {
            "type":Date,
        },
        "active":
        {
            "type":Boolean,
            "default":true,
            "select":false,
        }
    }
);

userSchema.pre("save",async function(next)
{
    if(!this.isModified("password"))    // Only runs if password was actually modified
    {
        return next();
    }
    this.password=await bcrypt.hash(this.password,12);  // Hash the password with cost 12
    this.passwordConfirm=undefined; // delete the passwordConfirm field 
    next();
});

userSchema.pre("save",function(next)
{
    if(!this.isModified("password")||this.isNew)
    {
        return next();
    }
    this.passwordChangedAt=Date.now()-1000;
    next();
});

userSchema.pre(/^find/,function(next)
{
    // this points to current query
    this.find({"active":{$ne:false}});
    next();
});

userSchema.methods.correctPassword=async function(candidatePassword,userPassword)
{
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter=function(JWTTimestamp)
{
    if(this.passwordChangedAt)
    {
        var changedTimeStamp=parseInt(this.passwordChangedAt.getTime()/1000,10); 
        // console.log(JWTTimestamp);
        // console.log(changedTimeStamp);
        if(JWTTimestamp<changedTimeStamp)
        {
            // console.log("true");
            return true;
        }
        else
        {
            // console.log("false");
            return false;
        }
    }
    // False means not changed
    return false;
}

userSchema.methods.createPasswordResetToken=function()
{
    var resetToken=crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    console.log({resetToken},this.passwordResetToken);
    this.passwordResetExpires=Date.now()+10*60*1000;
    return resetToken;
}

var User=mongoose.model("User",userSchema);

module.exports=User;