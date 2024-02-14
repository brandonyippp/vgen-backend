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
      const response = await todoRepository.findAll(session.userID);
      const todos = await response.toArray();

      if (todos.length) {
        return res.status(200).send(todos);
      }

      return res.status(400).send({});
    } catch (error) {
      console.log(`Failed to retrieve: ${error}`);
      return res
        .status(500)
        .send({ error: "Retrieval of user todo's failed." });
    }
  });

  return router;
};
