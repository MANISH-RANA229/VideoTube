import dotenv from "dotenv";


import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
});


connectDB()


























/*(async()=>{
    try {
       await mongoose.connect(`${Process.env.MONGODB_URL}/${DB_NAME}`)
       app.on("error",(error)=>{
              console.log("Error in connecting to server",error);
              //Kya pata express server chal raha ho aur mongo db server se connect nahi ho raha ho
              throw error
       })

         app.listen(Process.env.PORT,()=>{
              console.log(`Server is running on port ${Process.env.PORT}`);
         })


        
    } catch (error) {
        console.log("Error:--->",error);
        
    }

})()*/