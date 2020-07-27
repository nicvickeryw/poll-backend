import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectWithApp } from "./routes";
import APP_ENV from "./utils/environment";
import { EventEmitter } from "events";

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

export const voteEmitter = new EventEmitter();

const port = 9000;
const server = app.listen(port, async (err) => {
  if (err) {
    return console.error(err);
  }

  connectWithApp(app);

  return console.log(`server is listening on ${port}`);
});

const io = require("socket.io")(server);

io.on("connection", (client: any) => {
  const voteForPoll = (voteId: string) => {
    client.emit("votes", voteId);
  };

  voteEmitter.on("newVote", voteForPoll);

  client.on("subscribeToVotes", (pollId: string) => {
    console.log("subbing to votes");
  });

  client.on("disconnect", () => {
    console.log("client disconnected!");
    voteEmitter.removeListener("newVote", voteForPoll);
  });
});
