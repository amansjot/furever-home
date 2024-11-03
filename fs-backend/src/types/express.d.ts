import express from "express";

declare module "express" {
  export interface Request {
    user?: { userId: string }; // Adjust to match your JWT payload structure
  }
}
