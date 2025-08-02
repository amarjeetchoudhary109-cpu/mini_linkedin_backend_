import prisma from "../lib/prisma";
import { loginSchema, userRegisterSchema } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import { ApiResponse } from "../utils/ApiResponse";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
export const createUser = asyncHandler(async (req, res) => {
    const result = userRegisterSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.format(),
        });
    }
    const { name, email, bio, password, username } = result.data;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
        throw new ApiError(500, "Failed to hash password");
    }
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            bio,
            username: username.toLowerCase(),
            password: hashedPassword,
        },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return res.status(201).json(new ApiResponse(201, newUser, "User created successfully"));
});
export const loginUser = asyncHandler(async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.format(),
        });
    }
    const { email, password } = result.data;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password");
    }
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    if (!accessToken || !refreshToken) {
        throw new ApiError(500, "Failed to generate tokens");
    }
    await prisma.user.update({
        where: {
            id: user.id
        },
        data: {
            refreshToken
        }
    });
    res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 40 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    res.status(200).json(new ApiResponse(200, {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio
        },
        accessToken,
        refreshToken
    }, "Login successful"));
});
export const updateUserBio = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const { bio } = req.body;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }
    if (!bio || bio.trim().length === 0) {
        throw new ApiError(400, "Bio is required");
    }
    if (bio.length > 500) {
        throw new ApiError(400, "Bio must be less than 500 characters");
    }
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { bio: bio.trim() },
        select: {
            id: true,
            name: true,
            email: true,
            username: true,
            bio: true,
            createdAt: true,
            updatedAt: true,
        }
    });
    return res.status(200).json(new ApiResponse(200, updatedUser, "Bio updated successfully"));
});
