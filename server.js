var mongoose=require("mongoose");
var dotenv=require("dotenv");

process.on("uncaughtException",(err)=>
{
    console.log("UNCAUGHT EXCEPTION 💥 Shutting down...");
    console.log(err.name,err.message);
});

dotenv.config({path:"./config.env"});

var app=require("./index");

var DB=process.env.DATABASE.replace(`<PASSWORD>`,process.env.PASSWORD);

mongoose.connect(DB)
    .then(()=>
    {
        console.log("\nDB connection success\n");
    });



// var testTour=new Tour(
//     {
//         "name":"The park camper",
//         "price":997,
//     }
// );

// testTour.save()
//     .then((doc)=>
//     {
//         console.log(doc);
//     })
//     .catch((err)=>
//     {
//         console.log("Error💥");
//         console.log(err);
//         throw err;
//     });

const port=process.env.PORT||3000;

// console.log(process.env);

var server=app.listen(port,()=>
{
    console.log(`\nListening on port ${port}\n`);
});

process.on("unhandledRejection",(err)=>
{
    console.log(err.name,err.message);
    console.log("UNHANDLED REJECTION 💥 Shutting down...");
    server.close(()=>
    {
        process.exit(1);
    });
});


