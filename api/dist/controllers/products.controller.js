"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = getProducts;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
const service = __importStar(require("../services/products.service"));
async function getProducts(req, res) {
    try {
        const products = await service.getProducts(req.query);
        res.json(products);
    }
    catch (err) {
        res.status(500).json({ error: err.message || "Failed to fetch products" });
    }
}
async function createProduct(req, res) {
    try {
        const product = await service.createProduct(req.body);
        res.status(201).json(product);
    }
    catch (err) {
        res.status(400).json({ error: err.message || "Failed to create product" });
    }
}
async function updateProduct(req, res) {
    try {
        const id = Number(req.params.id);
        const product = await service.updateProduct(id, req.body);
        res.json(product);
    }
    catch (err) {
        res.status(400).json({ error: err.message || "Failed to update product" });
    }
}
