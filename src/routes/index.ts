import { connect, MongoClient } from "mongodb";
import { Express } from "express";
import { v4 as uuid } from "uuid";
import { Request } from "express";
import APP_ENV from "../utils/environment";
import { voteEmitter } from "../app";

export type Poll = {
  pollId?: string;
  title: string;
  options: PollOption[];
};

interface PollOption {
  id?: string; // Added by server
  title: string;
  votes: number;
}

const uri = `mongodb+srv://${APP_ENV.DB_USER}:${APP_ENV.DB_PASSWORD}@cluster0-0fcm1.mongodb.net/polls?retryWrites=true&w=majority`;

/**
 * Connects our Mongo instance with the Express application so we can interact with the Mongo client.
 *
 * @param app - The express app containing our routes
 */
export function connectWithApp(app: Express) {
  connect(uri, {
    useUnifiedTopology: true,
  }).then((client: MongoClient) => {
    console.log("Connected to database");
    const db = client.db("poll-app");
    const polls = db.collection<Poll>("polls");

    app.get("/polls", async (req, res) => {
      const foundPolls = await polls.find().toArray();
      res.send({ polls: foundPolls });
    });

    app.get("/polls/:id", (req, res) => {
      const { id } = req.params;

      polls
        .findOne({ pollId: id })
        .then((poll) => {
          res.send(poll);
        })
        .catch((error: any) => console.error(error));
    });

    app.post(
      "/poll",
      (req: Request<Record<string, string>, any, Poll>, res) => {
        const pollId = uuid();
        // Add extra uuids to each selected option, so we can track selection.
        const body = {
          ...req.body,
          options: req.body.options.map((option) => ({
            ...option,
            id: uuid(),
          })),
        };

        polls
          .insertOne({ ...body, pollId })
          .then(({ ops }: any) => {
            res.send(ops.pop());
          })
          .catch((error: any) => console.error(error));
      }
    );

    app.put("/poll/:id", (req, res) => {
      const { id } = req.params;
      const { vote } = req.body;

      // Emit the new vote to all listeners.
      voteEmitter.emit("newVote", vote);

      polls
        .updateOne(
          { pollId: id },
          { $inc: { "options.$[element].votes": 1 } },
          {
            arrayFilters: [{ "element.id": vote }],
          }
        )
        .then(() => {
          res.send({ data: { success: true } });
        });
    });
  });
}
