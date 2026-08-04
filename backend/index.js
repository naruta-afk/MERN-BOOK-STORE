import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./src/config/db.js";


const app = express();

connectDB();

app.use(cors());




app.use(express.json());

const PORT = process.env.PORT || 5000;

