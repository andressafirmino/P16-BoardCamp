import { Router } from "express";
import { getGame } from "../controllers/game.controller.js";

const gameRouter = Router();

gameRouter.get("/games", getGame);

export default gameRouter;