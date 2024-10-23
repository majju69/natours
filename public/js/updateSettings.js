import axios from "axios";
import { showAlert } from "./alerts";

// type is either data or password
export var updateSettings=async (data,type)=>
{
    try
    {

        var url=type==="data"?"http://localhost:3000/api/v1/users/updateMe":"http://localhost:3000/api/v1/users/updateMyPassword"
        // console.log("hello");
        // console.log(email,name);
        var res=await axios(
            {
                method:"PATCH",
                url:url,
                data:data,
            }
        );
        if(res.data.status==="success")
        {
            showAlert("success",`${type.toUpperCase()} updated succesfully`);
            // window.setTimeout(()=>
            // {
            //     location.assign("/");
            // },1500);
        }
        // console.log(res);
    }
    catch(err)
    {
        showAlert("error",err.response.data.message);
    }
}



// document.querySelector(".form").addEventListener("submit",(event)=>
// {
//     event.preventDefault();
//     var email=document.getElementById("email").value;
//     var password=document.getElementById("password").value;
//     login(email,password);
// });