import { Router } from "express";
import { validateSchema } from "../middlewares/validateSchema.js";
import { postRentalsSchema } from "../schemas/rentals.schema.js";
import { deleteRentals, getRentals, postRentals, postReturn } from "../controllers/rentals.controller.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);
rentalsRouter.post("/rentals", validateSchema(postRentalsSchema), postRentals);
rentalsRouter.post("/rentals/:id/return", postReturn);
rentalsRouter.delete("/rentals/:id", deleteRentals);

export default rentalsRouter;