import express from 'express'
import dotenv from 'dotenv'
import blogRoutes from './routes/blog.js'
import { errorHandler, notFoundHandler } from './middlewares/error.js'

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
})

app.use("/api/v1", blogRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port,() => {
    console.log(`Server is running on http://localhost:${port}`);
})