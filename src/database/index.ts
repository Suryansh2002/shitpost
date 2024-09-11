import mongoose from "mongoose";

export default async function connectDb(){
    await mongoose.connect(process.env.DATABASE_URL!).then(()=>{
        console.log("Database connected successfully !");
    }).catch((err)=>{
        console.log("Error connecting to database !", err);
    })
}