import { z } from "zod";
export const userRegisterSchema = z.object({
    name: z.string().min(2, "Name must be more than 4 letter long"),
    username: z.string().min(4, "Username must be more than 4 letter long").toLowerCase(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be more than 6 letter long").max(20, "Password must be less than 20 letter long"),
    bio: z.string().min(10, "Bio must be more than 10 letter long").max(100, "Bio must be less than 100 letter long")
});
export const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, "Password must be more than 6 letter long").max(20, "Password must be less than 20 letter long")
});
export const bioSchema = z.object({
    bio: z.string().max(300, "Bio must be 300 characters or less"),
});
