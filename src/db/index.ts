import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

const db = drizzle({ connection: { uri: process.env.DATABASE_URL } });

export default db;

export async function checkDatabaseConnection() {
  try {
    // Execute a simple query to test the connection
    await db.execute("SELECT 1");
    console.log("✅ Database connection established successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // Exit the process if the database connection fails
  }
}
