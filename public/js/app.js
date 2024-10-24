import "@babel/polyfill";
import {login, logout} from "./login";
import {updateSettings} from "./updateSettings"
// import {bookTour} from "./stripe"

// DOM ELEMENTS
var loginForm=document.querySelector(".form--login");
var logOutBtn=document.querySelector(".nav__el--logout");
var userDataForm=document.querySelector(".form-user-data");
var userPasswordForm=document.querySelector(".form-user-password");
var bookBtn=document.getElementById("book-tour");
// console.log(bookBtn);

if(loginForm)
{
    loginForm.addEventListener("submit",(event)=>
    {
        event.preventDefault();
        var email=document.getElementById("email").value;
        var password=document.getElementById("password").value;
        // console.log(email);
        // console.log(password);
        login(email,password);
    });
}

if(logOutBtn)
{
    console.log("Logout");
    logOutBtn.addEventListener("click",logout);
}

if(userDataForm)
{
    userDataForm.addEventListener("submit",(event)=>
    {
        event.preventDefault();
        var form=new FormData();
        form.append("name",document.getElementById("name").value);
        form.append("email",document.getElementById("email").value);
        form.append("photo",document.getElementById("photo").files[0]);
        console.log(form);
        // var email=document.getElementById("email").value;
        // var name=document.getElementById("name").value;
        // console.log(name,email);
        updateSettings(form,"data");
    });
}

if(userPasswordForm)
{
    userPasswordForm.addEventListener("submit",async (event)=>
    {
        event.preventDefault();
        document.querySelector(".btn--save-password").textContent="Updating...";
        var passwordCurrent=document.getElementById("password-current").value;
        var password=document.getElementById("password").value;
        var passwordConfirm=document.getElementById("password-confirm").value;
        await updateSettings({passwordCurrent,password,passwordConfirm},"password");
        document.querySelector(".btn--save-password").textContent="Save password";
        document.getElementById("password-current").value="";
        document.getElementById("password").value="";
        document.getElementById("password-confirm").value="";

    });
}

if(bookBtn)
{
    bookBtn.addEventListener("click",(event)=>
    {
        console.log(event);
        event.target.textContent="Processing";
        var {tourId}=event.target.dataset;
        bookTour(tourId);
        // event.target.textContent="Processing";
    });
}