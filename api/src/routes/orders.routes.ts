import { Router } from "express";
import * as controller from "../controllers/orders.controller";

const router = Router();

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);
router.get("/:id", controller.getOrder);

export default router;
