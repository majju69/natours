import axios from "axios";
import { showAlert } from "./alerts";

export var login=async (email,passord)=>
{
    try
    {
        // console.log("hello");
        // console.log(email,passord);
        var res=await axios(
            {
                method:"POST",
                url:"http://localhost:3000/api/v1/users/login",
                data:
                {
                    email:email,
                    password:passord,
                }
            }
        );
        if(res.data.status==="success")
        {
            showAlert("success","Logged in succesfully");
            window.setTimeout(()=>
            {
                location.assign("/");
            },1500);
        }
        // console.log(res);
    }
    catch(err)
    {
        showAlert("error",err.response.data.message);
    }
}

export var logout=async ()=>
{
    try
    {
        // console.log("hello");
        // console.log(email,passord);
        var res=await axios(
            {
                method:"GET",
                url:"http://localhost:3000/api/v1/users/logout",
            }
        );
        if(res.data.status==="success")
        {
            location.reload(true);
        }
        // console.log(res);
    }
    catch(err)
    {
        showAlert("error","Error logging out! Try again.");
    }
}

// document.querySelector(".form").addEventListener("submit",(event)=>
// {
//     event.preventDefault();
//     var email=document.getElementById("email").value;
//     var password=document.getElementById("password").value;
//     login(email,password);
// });