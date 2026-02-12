import { Request, Response } from "express";
import * as service from "../services/orders.service";

export async function getOrders(req: Request, res: Response) {
    try {
        const orders = await service.getOrders(req.query);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

export async function createOrder(req: Request, res: Response) {
    try {
        const order = await service.createOrder(req.body);
        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ error: "Failed to create order" });
    }
}

export async function getOrder(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const order = await service.getOrder(id, req.query);
        res.json(order);
    } catch (err) {
        res.status(400).json({ error: "Failed to fetch order" });
    }
}
