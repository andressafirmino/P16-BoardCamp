import { Router } from "express";
import { getCustomers } from "../controllers/customers.controllers.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.post("/customers");

export default customersRouter;