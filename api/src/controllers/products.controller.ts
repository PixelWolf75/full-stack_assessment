import { Request, Response } from "express";
import * as service from "../services/products.service";

export async function getProducts(req: Request, res: Response) {
    try {
        const products = await service.getProducts(req.query);
        res.json(products);
    } catch (err: any) {
        res.status(500).json({ error: err.message || "Failed to fetch products" });
    }
}

export async function createProduct(req: Request, res: Response) {
    try {
        const product = await service.createProduct(req.body);
        res.status(201).json(product);
    } catch (err: any) {
        res.status(400).json({ error: err.message || "Failed to create product" });
    }
}

export async function updateProduct(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const product = await service.updateProduct(id, req.body);
        res.json(product);
    } catch (err: any) {
        res.status(400).json({ error: err.message || "Failed to update product" });
    }
}
