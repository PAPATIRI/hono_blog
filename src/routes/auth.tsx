import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { FC } from "hono/jsx";
import { loginSchema, registerSchema, users } from "../db/schema";
import db from "../db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";

const app = new Hono();

const LoginPage: FC = () => {
  return (
    <div>
      <h1>login</h1>
      <form action="/auth/login" method="post">
        <div>
          <label htmlFor="email">email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="sample@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            required
          />
        </div>
        <button type="submit">login</button>
      </form>
      <p>
        Don't have an account? <a href="/auth/register">Register</a>
      </p>
    </div>
  );
};

const RegisterPage: FC = () => {
  return (
    <div>
      <h1>login</h1>
      <form action="/auth/register" method="post">
        <div>
          <label htmlFor="email">email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="sample@email.com"
            required
          />
        </div>
        <div>
          <label htmlFor="name">name</label>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="type your name"
            required
          />
        </div>
        <div>
          <label htmlFor="password">password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="********"
            required
          />
        </div>
        <button type="submit">register</button>
      </form>
      <p>
        Already have an account? <a href="/auth/login">Login</a>
      </p>
    </div>
  );
};

app.get("/login", (c) => {
  return c.html(<LoginPage />);
});

app.get("/register", (c) => {
  return c.html(<RegisterPage />);
});

app.post("/login", zValidator("form", loginSchema), async (c) => {
  const { email, password } = c.req.valid("form");

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return c.json({ error: "Invalid credentials" }, 401);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return c.json({ error: "Invalid credentials" }, 401);

    //create jwt token
    const token = await sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
      },
      process.env.JWT_SECRET || "jwtsecretasoy"
    );

    //sec cookie
    setCookie(c, "auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    const redirectMap = {
      admin: "/admin",
      writer: "/writer",
      user: "/user",
    };

    return c.redirect(
      redirectMap[user.role as keyof typeof redirectMap] || "/"
    );
  } catch (error) {
    console.error("login error", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

app.post("/register", zValidator("form", registerSchema), async (c) => {
  const { email, password, name } = c.req.valid("form");

  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) return c.json({ error: "Email already in use" }, 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const result = await db
      .insert(users)
      .values({ email, password: hashedPassword, name, role: "user" });

    // Extract the insertId (add type assertion since TypeScript doesn't recognize it)
    const insertId = result[0]?.insertId;

    // Then, query the newly created user to get all fields
    const newUser = await db
      .select()
      .from(users)
      .where(eq(users.id, insertId))
      .limit(1)
      .then((rows) => {
        if (rows.length === 0) {
          console.error("No user found with ID: ", insertId);
        }

        return rows[0];
      });

    if (!newUser) {
      return c.json({ error: "User  not found after registration" }, 500);
    }

    //create jwt token
    const token = await sign(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 5,
      },
      process.env.JWT_SECRET || "jwtsecretasoy"
    );

    //set cookie
    setCookie(c, "auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return c.redirect("/user");
  } catch (error) {
    console.error("registration error: ", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

//logout handler
app.get("/logout", (c) => {
  setCookie(c, "auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });

  return c.redirect("/");
});

export const authRoutes = app;
