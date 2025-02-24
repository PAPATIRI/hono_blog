import { Hono } from "hono";
import { FC } from "hono/jsx";

const app = new Hono();

const HomePage: FC = () => {
  return (
    <div>
      <h1>hello homepage</h1>
    </div>
  );
};

app.get("/", (c) => {
  return c.html(<HomePage />);
});

export const publicRoutes = app;
