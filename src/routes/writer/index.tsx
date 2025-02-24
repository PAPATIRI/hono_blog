import { FC } from "hono/jsx";
import { Hono } from "hono";

const app = new Hono();

const WriterHomePage: FC = () => {
  return (
    <div>
      <h1>welcome writer</h1>
    </div>
  );
};

app.get("/", (c) => {
  return c.html(<WriterHomePage />);
});

export const writerRoutes = app;
