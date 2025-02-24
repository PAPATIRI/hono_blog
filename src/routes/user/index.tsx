import { FC } from "hono/jsx";
import { Hono } from "hono";

const app = new Hono();

const UserHomePage: FC = () => {
  return (
    <div>
      <h1>welcome user</h1>
    </div>
  );
};

app.get("/", (c) => {
  return c.html(<UserHomePage />);
});

export const userRoutes = app;
