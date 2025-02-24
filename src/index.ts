import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { serveStatic } from "hono/serve-static";
import { promises as fs } from "fs";
import { join } from "path";
import { checkDatabaseConnection } from "./db";
import { authRoutes } from "./routes/auth";
import { publicRoutes } from "./routes";
import { authenticated } from "./middleware/auth";
import { userRoutes } from "./routes/user";
import { adminRoutes } from "./routes/admin";
import { writerRoutes } from "./routes/writer";

const app = new Hono();

// middleware hono
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "/public/*",
  serveStatic({
    root: "./",
    getContent: async (path, c) => {
      const fullPath = join(process.cwd(), path);
      try {
        const content = await fs.readFile(fullPath);
        return new Response(content);
      } catch (error) {
        return new Response("File not found", { status: 404 });
      }
    },
  })
);
app.use("/admin/*", authenticated);
app.use("/user/*", authenticated);
app.use("/writer/*", authenticated);

app.route("/auth", authRoutes);
app.route("/", publicRoutes);
app.route("/user", userRoutes);
app.route("/admin", adminRoutes);
app.route("/writer", writerRoutes);

app.onError((err, c) => {
  console.error("App error", err);
  return c.text("something went wrong", 500);
});

const init = async () => {
  await checkDatabaseConnection();

  const port = process.env.PORT || 3000;
  console.log(`🚀 Server is running on http://localhost:${port}`);
};

// Run initialization
init();
export default app;
