import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import locationRoutes from "./routes/location.routes.js";
import userRoutes from "./routes/user.routes.js";
import hospitalRoutes from "./routes/hospital.routes.js";


const app =  express();
app.use(express.json());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}));
dotenv.config();

const PORT = process.env.PORT || 5000;

app.use("/locations",locationRoutes);
app.use("/user",userRoutes);
app.use("/hospital",hospitalRoutes);





app.listen(PORT, ()=>{
    console.log(`Backend running on ${PORT}`)
});