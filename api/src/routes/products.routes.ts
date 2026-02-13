import { Router } from "express";
import * as controller from "../controllers/products.controller";

const productRouter = Router();

productRouter.get("/", controller.getProducts);
productRouter.post("/", controller.createProduct);
productRouter.patch("/:id", controller.updateProduct);

export default productRouter;
