import { FC } from "hono/jsx";
import { Hono } from "hono";

const app = new Hono();

const AdminHomePage: FC = () => {
  return (
    <div>
      <h1>welcome admin</h1>
    </div>
  );
};

app.get("/", (c) => {
  return c.html(<AdminHomePage />);
});

export const adminRoutes = app;
