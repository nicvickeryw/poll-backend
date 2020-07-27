import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectWithApp } from "./routes";
import APP_ENV from "./utils/environment";

const app = express();
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // For form submission
app.use(
  cors({
    origin: APP_ENV.FRONT_END_ORIGIN_URI,
  }),
  jsonParser,
  urlencodedParser
);
const port = APP_ENV.PORT;

app.listen(port, async (err) => {
  if (err) {
    return console.error(err);
  }

  connectWithApp(app);

  return console.log(`server is listening on ${port}`);
});
