import dotenv from "dotenv";
import { getPgVersion } from "./db";
import { app } from "./app";
dotenv.config();
getPgVersion()
    .then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})
    .catch((err) => {
    console.error("Failed to start the server:", err);
    process.exit(1);
});
