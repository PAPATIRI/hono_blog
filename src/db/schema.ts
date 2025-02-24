import {
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";
import { z } from "zod";

export const UserRole = {
  ADMIN: "admin",
  WRITER: "writer",
  USER: "user",
} as const;

// user table
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 191 }).unique().notNull(),
  password: varchar("password", { length: 191 }).unique().notNull(),
  name: varchar("name", { length: 191 }).notNull(),
  role: mysqlEnum("role", Object.values(UserRole) as [string, ...string[]])
    .notNull()
    .default(UserRole.USER),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

// custom zod scheme for auth
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(3).max(100),
});
