import express from "express";
import { connect } from "mongodb";
import { config } from "dotenv";

const app = express();
config();
const port = 9000;
// @TODO: remove username/password from repo - this should be an environment variable
const uri =
  "mongodb+srv://eps11:OxoSFfmcae3sIhcz@cluster0-0fcm1.mongodb.net/polls?retryWrites=true&w=majority";

app.get("/", (req, res) => {
  res.send("The sedulous hyena ate the antelope!");
});

app.listen(port, (err) => {
  if (err) {
    return console.error(err);
  }

  connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-0fcm1.mongodb.net/polls?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
    },
    (err: any, client) => {
      if (err) {
        return console.error(err);
      }
      console.log("Connected to database");
      const db = client.db("poll-app");
      const polls = db.collection("polls");

      app.get("/polls", (req, res) => {
        polls.findOne({ title: "cunt" }).then((poll) => {
          console.log(poll);

          res.send("Go fuck yourself");
        });
      });

      app.post("/polls", (req, res) => {
        polls
          .insertOne(req.body)
          .then((result: any) => {
            console.log(result);
          })
          .catch((error: any) => console.error(error));
      });
    }
  );

  return console.log(`server is listening on ${port}`);
});
