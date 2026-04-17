import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import prisma from "../utils/db.js";
import AppError from "../utils/AppError..js";
import catchAsync from "../utils/catchAsync.js";
import getBuffer from "../utils/dataUri.js";

export const createBlog = catchAsync(async (req: AuthenticatedRequest, res) => {
    const { title, description, blogContent, category } = req.body ?? {};

    if (!req.user) {
        throw new AppError("Please Login", 401);
    }

    if (!title || !description || !blogContent || !category) {
        throw new AppError("Title, description, blog content and category are required", 400);
    }

    const file = req.file;

    if (!file) {
        throw new AppError("No File To Upload", 400);
    }

    const fileBuffer = getBuffer(file);

    if (!fileBuffer || !fileBuffer.content) {
        throw new AppError("Failed To Generate Buffer", 400);
    }

    const uploadResult = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "blogs",
    });

    const blog = await prisma.blog.create({
        data: {
            title: String(title).trim(),
            description: String(description).trim(),
            blogcontent: String(blogContent).trim(),
            image: uploadResult.secure_url,
            category: String(category).trim(),
            author: req.user._id,
        },
    });

    res.status(201).json({
        message: "Blog Created Successfully",
        blog,
    });
});