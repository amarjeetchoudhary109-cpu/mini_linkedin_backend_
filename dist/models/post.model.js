import { z } from "zod";
export const createPostSchema = z.object({
    content: z.string().min(1, { message: "Post content is required" }),
    imageUrl: z.string().url().optional(),
});
