import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import AppError from "../utils/AppError..js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from 'cloudinary'

export const loginUser = catchAsync(async(req,res) => {
    const { email, name, image } = req.body;
    
    let user = await User.findOne({email});

    if(!user) {
        user = await User.create({
            name,
            email,
            image
        })
    }

    const token = jwt.sign({user},process.env.JWT_SEC as string, {
        expiresIn: "5d"
    });

    res.status(200).json({
        message: "Login Success",
        token,
        user
    })
})

export const myProfile = catchAsync(async(req: AuthenticatedRequest,res) => {
    const user  = req.user;

    res.json(user)
})

export const getUserProfile = catchAsync(async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user){
        throw new AppError("No User With this Id",404);
    }

    res.json(user);
})

export const updateUser = catchAsync(async(req: AuthenticatedRequest,res)=>{
    const {name, instagram, facebook, linkedIn, bio} = req.body ?? {};

    if (!req.body) {
        throw new AppError("Invalid request body", 400);
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        name,
        facebook,
        instagram,
        linkedIn,
        bio
    },{
        returnDocument: "after"
    })


    const token = jwt.sign({user},process.env.JWT_SEC as string, {
        expiresIn: "5d"
    });

    res.json({
        message: "User Updated",
        token,
        user
    });
})

export const updateProfilePic = catchAsync(async(req:AuthenticatedRequest,res)=>{
    console.log("hello")
    const file = req.file;

    if(!file) {
        throw new AppError("No File To Upload",400)
    }

    // Generate data URI from file buffer
    const fileBuffer = getBuffer(file);

    if(!fileBuffer || !fileBuffer.content) {
        throw new AppError("Failed To Generate Buffer",400)
    }

    // Upload data URI to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(fileBuffer.content, {
        folder: "mindframe"
    });

    // Update user profile picture
    const user = await User.findByIdAndUpdate(req.user?._id, {
        image: uploadResult.secure_url
    }, {
        returnDocument: "after"
    });

    // Generate new token with updated user
    const token = jwt.sign({user}, process.env.JWT_SEC as string, {
        expiresIn: "5d"
    });

    res.status(200).json({
        message: "Profile Picture Updated Successfully",
        token,
        user
    });
})