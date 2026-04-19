import { v2 as cloudinary } from "cloudinary";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import prisma from "../utils/db.js";
import AppError from "../utils/AppError..js";
import catchAsync from "../utils/catchAsync.js";
import getBuffer from "../utils/dataUri.js";

export const createBlog = catchAsync(async (req: AuthenticatedRequest, res) => {
    const { title, description, blogcontent, category } = req.body ?? {};

    if (!req.user) {
        throw new AppError("Please Login", 401);
    }

    if (!title || !description || !blogcontent || !category) {
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
            blogcontent: String(blogcontent).trim(),
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

export const updateBlog = catchAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        throw new AppError("Please Login", 401);
    }

    const blogId = Number(req.params.id);

    if (!Number.isInteger(blogId) || blogId <= 0) {
        throw new AppError("Invalid blog id", 400);
    }

    const existingBlog = await prisma.blog.findUnique({
        where: { id: blogId },
    });

    if (!existingBlog) {
        throw new AppError("No Blog With this Id", 404);
    }

    if (existingBlog.author !== req.user._id) {
        throw new AppError("You are not allowed to update this blog", 403);
    }

    const title = typeof req.body?.title === "string" ? req.body.title.trim() : undefined;
    const description = typeof req.body?.description === "string" ? req.body.description.trim() : undefined;
    const blogcontent = typeof req.body?.blogcontent === "string"
        ? req.body.blogcontent.trim()
        : typeof req.body?.blogContent === "string"
            ? req.body.blogContent.trim()
            : undefined;
    const category = typeof req.body?.category === "string" ? req.body.category.trim() : undefined;

    if (!title && !description && !blogcontent && !category && !req.file) {
        throw new AppError("Please provide at least one field to update", 400);
    }

    const data: {
        title?: string;
        description?: string;
        blogcontent?: string;
        category?: string;
        image?: string;
    } = {};

    if (title) {
        data.title = title;
    }

    if (description) {
        data.description = description;
    }

    if (blogcontent) {
        data.blogcontent = blogcontent;
    }

    if (category) {
        data.category = category;
    }

    if (req.file) {
        const fileBuffer = getBuffer(req.file);

        if (!fileBuffer || !fileBuffer.content) {
            throw new AppError("Failed To Generate Buffer", 400);
        }

        const uploadResult = await cloudinary.uploader.upload(fileBuffer.content, {
            folder: "blogs",
        });

        data.image = uploadResult.secure_url;
    }

    const blog = await prisma.blog.update({
        where: { id: blogId },
        data,
    });

    res.status(200).json({
        message: "Blog Updated Successfully",
        blog,
    });
});

export const deleteBlog = catchAsync(async (req: AuthenticatedRequest, res) => {
    if (!req.user) {
        throw new AppError("Please Login", 401);
    }

    const blogId = Number(req.params.id);
    const blogIdAsString = String(blogId);

    if (!Number.isInteger(blogId) || blogId <= 0) {
        throw new AppError("Invalid blog id", 400);
    }

    const existingBlog = await prisma.blog.findUnique({
        where: { id: blogId },
    });

    if (!existingBlog) {
        throw new AppError("No Blog With this Id", 404);
    }

    if (existingBlog.author !== req.user._id) {
        throw new AppError("You are not allowed to delete this blog", 403);
    }

    await prisma.$transaction([
        prisma.savedBlog.deleteMany({
            where: { blogId: blogIdAsString },
        }),
        prisma.comment.deleteMany({
            where: { blogId: blogIdAsString },
        }),
        prisma.blog.delete({
            where: { id: blogId },
        }),
    ]);

    res.status(200).json({
        message: "Blog Deleted Successfully",
    });
});