import { Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import User from "../models/User.js";
import jwt from 'jsonwebtoken';

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

export const myProfile = catchAsync(async(req) => {

})