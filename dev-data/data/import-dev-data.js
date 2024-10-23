var fs=require("fs");
var mongoose=require("mongoose");
var dotenv=require("dotenv");
dotenv.config({path:"./config.env"});
var Tour=require("./../../models/tourModel");
var User=require("./../../models/userModel");
var Review=require("./../../models/reviewModel");

var DB=process.env.DATABASE.replace(`<PASSWORD>`,process.env.PASSWORD);

mongoose.connect(DB)
    .then(()=>
    {
        console.log("\nDB connection success\n");
    });

/*********READ JSON FILE*********/

var tours=JSON.parse(fs.readFileSync(`${__dirname}/tours.json`,"utf-8"));
var users=JSON.parse(fs.readFileSync(`${__dirname}/users.json`,"utf-8"));
var reviews=JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`,"utf-8"));

/******IMPORT DATA TO DB*********/

var importData=async()=>
{
    try
    {
        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(reviews);
        console.log(`\nData successfully loaded\n`);
    }
    catch(err)
    {
        console.log(err);
    }
    process.exit();
}

/*****DELETE ALL DATA FROM DB*******/

var deleteData=async()=>
{
    try
    {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log(`\nData successfully deleted\n`);
    }
    catch(err)
    {
        console.log(err);
    }
    process.exit();
}

if(process.argv[2]==="--import")
{
    importData();
}
else if(process.argv[2]==="--delete")
{
    deleteData();
}
else
{
    ;
}

console.log(process.argv);