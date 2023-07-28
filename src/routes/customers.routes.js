import { Router } from "express";
import { getCustomers, getCustomersId, postCustomers, putCustomers } from "../controllers/customers.controllers.js";
import { validateSchema } from "../middlewares/validateSchema.js";
import { postCustomersSchema } from "../schemas/customers.schema.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);
customersRouter.get("/customers/:id", getCustomersId);
customersRouter.post("/customers", validateSchema(postCustomersSchema), postCustomers);
customersRouter.put("/customers/:id", validateSchema(postCustomersSchema), putCustomers);

export default customersRouter;