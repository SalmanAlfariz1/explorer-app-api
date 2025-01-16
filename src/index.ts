import { Elysia } from "elysia";

//import routes
import Routes from "./routes";
import cors from "@elysiajs/cors";

//initiate elysia
const app = new Elysia()
  .use(cors())

//route home
app.get('/', () => 'Hello Elysia!');

//add routes
app.group('/api', (app) => app.use(Routes))


//start server on port 3000
app.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
