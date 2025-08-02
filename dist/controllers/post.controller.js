/// <reference path="../types/express.d.ts" />
import prisma from "../lib/prisma";
import { createPostSchema } from "../models/post.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
export const createPost = asyncHandler(async (req, res) => {
    const result = createPostSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.issues,
        });
    }
    let { content, imageUrl } = result.data;
    const userId = req.user?.id;
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }
    if (!content) {
        throw new ApiError(400, "Content is required");
    }
    if (req.file?.path) {
        const cloudinaryResult = await uploadOnCloudinary(req.file?.path, "posts");
        if (cloudinaryResult?.secure_url) {
            imageUrl = cloudinaryResult.secure_url;
        }
    }
    if (!imageUrl) {
        throw new ApiError(400, "Image is required");
    }
    const post = await prisma.post.create({
        data: {
            content,
            imageUrl,
            authorId: userId,
        },
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        }
    });
    return res.status(201).json(new ApiResponse(201, post, "Post created successfully"));
});
export const getAllPosts = asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const whereClause = userId ? { authorId: userId } : {};
    const posts = await prisma.post.findMany({
        where: whereClause,
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.status(200).json(new ApiResponse(200, posts, "Posts fetched successfully"));
});
export const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;
    const userId = req.user?.id;
    const post = await prisma.post.findUnique({
        where: { id: postId },
    });
    if (!post)
        throw new ApiError(404, "Post not found");
    if (post.authorId !== req.user.id) {
        throw new ApiError(403, "You are not authorized to delete this post");
    }
    await prisma.post.delete({
        where: { id: postId },
    });
    return res.status(200).json(new ApiResponse(200, null, "Post deleted successfully"));
});
export const getUserPostByUsername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    const user = await prisma.user.findFirst({
        where: { username: username.toLowerCase() },
        select: {
            id: true,
            name: true,
            username: true,
            bio: true
        }
    });
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const posts = await prisma.post.findMany({
        where: { authorId: user.id },
        include: {
            author: {
                select: { id: true, name: true, username: true }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return res.status(200).json(new ApiResponse(200, { user, posts }, "User posts fetched successfully"));
});
