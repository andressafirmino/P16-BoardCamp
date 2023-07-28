import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { postRentalsSchema } from "../schemas/rentals.schema.js";
import { postRentals } from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals");
rentalsRouter.post("/rentals", validateSchema(postRentalsSchema), postRentals);

export default rentalsRouter;