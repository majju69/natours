export var hideAlert=()=>
{
    var element=document.querySelector(".alert");
    if(element)
    {
        element.parentElement.removeChild(element);
    }
}

export var showAlert=(type,msg)=>
{
    hideAlert();
    var markup=`<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin",markup);
    window.setTimeout(hideAlert,5000);
}