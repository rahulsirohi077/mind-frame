import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError..js";
import jwt, { JwtPayload } from 'jsonwebtoken';

interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    image?: string;
    instagram?: string;
    facebook?: string;
    linkedIn?: string;
    bio: string;
}

export interface AuthenticatedRequest extends Request {
    user?: IUser | null
}

export const isAuth = catchAsync(async (req:AuthenticatedRequest, res:Response, next:NextFunction):Promise<void> => {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        throw new AppError("Please Login - No Auth Header",401);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodeValue = jwt.verify(token,process.env.JWT_SEC as string) as JwtPayload;
        if(!decodeValue || !decodeValue.user) {
            throw new AppError("Invalid Token",401);
        }
        req.user = decodeValue.user;
        next();
    } catch (error) {
        throw new AppError("Please Login - Jwt Error", 401);
        // throw new AppError((error as Error).message, 401);
    }
})