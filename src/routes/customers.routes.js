import { Router } from "express";
import { getCustomers, getCustomersId } from "../controllers/customers.controllers.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersId);
customersRouter.post("/customers");

export default customersRouter;