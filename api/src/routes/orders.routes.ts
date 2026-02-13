import { Router } from "express";
import * as controller from "../controllers/orders.controller";

const orderRouter = Router();

orderRouter.get("/", controller.getOrders);
orderRouter.post("/", controller.createOrder);
orderRouter.get("/:id", controller.getOrder);

export default orderRouter;
