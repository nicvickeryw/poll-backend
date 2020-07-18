import express from "express";
import { connect } from "mongodb";
import { config } from "dotenv";
import { v4 as uuid } from "uuid";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });
config();
const port = 9000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-0fcm1.mongodb.net/polls?retryWrites=true&w=majority`;

app.get("/", (req, res) => {
  res.send("The sedulous hyena ate the antelope!");
});

app.listen(port, async (err) => {
  if (err) {
    return console.error(err);
  }

  connect(
    uri,
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

      app.get("/polls", async (req, res) => {
        const foundPolls = await polls.find().toArray();

        console.log(foundPolls);
        res.send(foundPolls.toString());
      });

      app.get("/polls/:id", (req, res) => {
        const { id } = req.params;

        polls.findOne({ pollId: id }).then((poll) => {
          console.log(poll);

          res.send("Go fuck yourself");
        });
      });

      app.post("/poll", jsonParser, (req, res) => {
        const pollId = uuid();
        polls
          .insertOne({ ...req.body, pollId })
          .then((result: any) => {
            console.log(result.ops);

            res.send(JSON.stringify(result.ops));
          })
          .catch((error: any) => console.error(error));
      });
    }
  );

  return console.log(`server is listening on ${port}`);
});
