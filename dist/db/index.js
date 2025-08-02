import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
dotenv.config();
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const sql = neon(`postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require&channel_binding=require`);
export async function getPgVersion() {
    try {
        const result = await sql `SELECT version()`;
        console.log("PostgreSQL Version:", result[0].version);
    }
    catch (error) {
        console.error("Error fetching PostgreSQL version:", error);
        process.exit(1);
    }
}
