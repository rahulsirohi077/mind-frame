import express from "express";
import dotenv from 'dotenv';
import blogRoutes from './routes/blog.js'
import { errorHandler, notFoundHandler } from "./middlewares/error.js";
import { v2 as cloudinary } from 'cloudinary'

dotenv.config();

cloudinary.config({ 
  cloud_name: process.env.Cloud_Name, 
  api_key: process.env.Cloud_Api_Key, 
  api_secret: process.env.Cloud_Api_Secret
});

const app = express();
const port = Number(process.env.PORT);

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.use("/api/v1", blogRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Author service running on  http://localhost:${port}`);
});