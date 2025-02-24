import { html } from "hono/html";
import { FC } from "hono/jsx";

type LayoutProps = {
  title: string;
  children: any;
  user?: {
    id: number;
    email: string;
    role: string;
  } | null;
};

export const Layout: FC<LayoutProps> = ({ title, children, user }) => {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title} - Blog App</title>
        <link rel="stylesheet" href="/public/styles/main.css" />
        <script src="https://unpkg.com/htmx.org@1.9.2"></script>
        <script src="https://unpkg.com/hyperscript.org@0.9.9"></script>
      </head>
      <body>
        <header>
          <nav>
            <div class="logo">
              <a href="/">Blog App</a>
            </div>
            <ul class="nav-links">
              <li><a href="/">Home</a></li>
              <li><a href="/posts">Posts</a></li>
              ${user
                ? `
                ${
                  user.role === "admin"
                    ? `<li><a href="/admin">Admin Dashboard</a></li>`
                    : ""
                }
                ${
                  user.role === "writer" || user.role === "admin"
                    ? `<li><a href="/writer">Writer Dashboard</a></li>`
                    : ""
                }
                <li><a href="/user">My Account</a></li>
                <li><a href="/auth/logout">Logout</a></li>
              `
                : `
                <li><a href="/auth/login">Login</a></li>
                <li><a href="/auth/register">Register</a></li>
              `}
            </ul>
          </nav>
        </header>
        <main>${children}</main>
        <footer>
          <p>&copy; ${new Date().getFullYear()} Blog App</p>
        </footer>
      </body>
    </html> `;
};
