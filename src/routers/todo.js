import express from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { v4 as uuidv4 } from "uuid";
import { validateTodo, validateUser } from "../schemas/validators.js";
import auth from "../middleware/auth.js";
import { verifyToken } from "../functions/cookies.js";

dayjs.extend(utc);
const router = express.Router();

export default ({ todoRepository }) => {
  // Create new todo
  router.post("/", auth, async (req, res) => {
    try {
      let session = verifyToken(req.cookies["todox-session"]);

      const todoID = uuidv4();
      const created = dayjs().utc().toISOString();

      let newTodo = {
        ...req.body,
        todoID,
        userID: session.userID,
        created,
        completed: false,
      };

      if (validateTodo(newTodo)) {
        let resultTodo = await todoRepository.insertOne(newTodo);
        return res.status(201).send(resultTodo);
      }
      console.error(validateTodo.errors);
      return res.status(400).send({ error: "Invalid field used." });
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Todo creation failed." });
    }
  });

  // Get all todo's for current signed-in user
  router.get("/todos", auth, async (req, res) => {
    try {
      let session = verifyToken(req.cookies["todox-session"]);
      const response = await todoRepository.find(session.userID);
      const todos = await response.toArray();

      if (todos.length) {
        return res.status(200).send(todos);
      }

      return res.status(400).send({});
    } catch (error) {
      console.log(`Failed to retrieve due to bad request: ${error}`);
      return res
        .status(500)
        .send({ error: "Retrieval of user todo's failed." });
    }
  });

  // Update todos
  router.post("/update", auth, async (req, res) => {
    try {
      let session = verifyToken(req.cookies["todox-session"]);

      if (!req.body || !req.body.length) {
        return res
          .status(400)
          .send({ error: "Bad request body - failed to update todo's." });
      }

      // Update matching documents completion status
      for (let i = 0; i < req.body.length; i++) {
        const todo = req.body[i];

        await todoRepository.updateOne(
          session.userID,
          todo.todoID,
          todo.status
        );
      }

      return res.status(200).send({});
    } catch (err) {
      console.error(err);
      return res.status(500).send({ error: "Todo update failed." });
    }
  });

  return router;
};
