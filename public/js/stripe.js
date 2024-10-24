// import axios from "axios";
// import { showAlert } from "./alerts";

// var stripe=Stripe("pk_test_51QD2m8GGHaWGJBhnRVJ7IP3DCPe80q7keny9VCjCD7nXEacSTvwJnu0CApy1AIE0sdNUrdB8N7acAivA8q6DosE800R9hUjDdS");

// // initialize();

// export var bookTour=async (tourId)=>
// {
//     try
//     {
//         // 1. Get checkout session fro API
//         var session=await axios(
//             {
//                 url:`http://localhost:3000/api/v1/bookings/checkout-session/${tourId}`
//             }
//         );
//         console.log(session);
//         // 2. Create checkout form + charge credit card 
//         await stripe.redirectToCheckout(
//             {
//                 sessionId:session.data.session.id,
//             }
//         );
//     }
//     catch(err)
//     {
//         console.log(err);
//         showAlert("error",err);
//     }
// }

