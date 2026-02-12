import { Router } from "express";
import * as controller from "../controllers/products.controller";

const router = Router();

router.get("/", controller.getProducts);
router.post("/", controller.createProduct);
router.patch("/:id", controller.updateProduct);

export default router;
