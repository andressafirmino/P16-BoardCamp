import { Router } from "express";
import { getGame, postGame } from "../controllers/game.controller.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { postGameSchema } from "../schemas/game.schema.js";

const gameRouter = Router();

gameRouter.get("/games", getGame);
gameRouter.post("/games", validateSchema(postGameSchema), postGame);

export default gameRouter;