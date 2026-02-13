"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = __importDefault(require("./schema"));
// Run schema creation then seeding
// Called once when the server starts
// @ts-ignore
async function initDatabase() {
    await (0, schema_1.default)();
}
exports.default = initDatabase;
