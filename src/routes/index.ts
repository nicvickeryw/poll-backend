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

/**
 * Connects our Mongo instance with the Express application so we can interact with the Mongo client.
 *
 * @param app - The express app containing our routes
 */
export function connectWithApp(app: Express) {
  connect(APP_ENV.DB_CONNECTION_STRING, {
    useUnifiedTopology: true,
  }).then((client: MongoClient) => {
    console.log("Connected to database");

    const db = client.db("poll-app");
    const polls = db.collection<Poll>("polls");

    app.get("/polls", async (req, res) => {
      const foundPolls = await polls.find().toArray();
      res.send({ polls: foundPolls });
    });

    app.get("/polls/:id", async (req, res) => {
      const { id } = req.params;

      res.send(await polls.findOne({ pollId: id }));
    });

    app.post(
      "/poll",
      async (req: Request<Record<string, string>, any, Poll>, res) => {
        const pollId = uuid();
        // Add extra uuids to each selected option, so we can track selection.
        const body = {
          ...req.body,
          options: req.body.options.map((option) => ({
            ...option,
            id: uuid(),
          })),
        };

        const addedPoll = (
          await polls.insertOne({ ...body, pollId })
        ).ops.pop();

        res.send(addedPoll);
      }
    );

    app.put("/poll/:id", async (req, res) => {
      const { id } = req.params;
      const { vote } = req.body;

      // Emit the new vote to all listeners.
      voteEmitter.emit("newVote", vote);

      await polls.updateOne(
        { pollId: id },
        { $inc: { "options.$[element].votes": 1 } },
        {
          arrayFilters: [{ "element.id": vote }],
        }
      );

      res.send({ data: { success: true } });
    });
  });
}
