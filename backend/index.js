import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();



const app = express();


app.use(cors());




app.use(express.json());

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() =>
        app.listen(PORT, () => console.log(`Server running on port: ${PORT}`))
    )
    .catch((error) => console.log(error.message));