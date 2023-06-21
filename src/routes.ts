import jwt, { JwtPayload } from "jsonwebtoken";

import { Router } from "express";
import bcrypt from "bcrypt";
import prisma from "./utils/prisma";

const router = Router();
const SECRET_KEY = process.env.SECRET_KEY;

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "user not found" });
  }
  const validPass = await bcrypt.compare(password, user?.password);
  if (!validPass) {
    return res.status(401).json({ message: "invlaid credentials" });
  }
  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, SECRET_KEY);
  return res.json({ token });
});

router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  const encryptPass = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { email, name, role: "USER", password: encryptPass },
    });
    return res
      .status(201)
      .json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
  } catch (error) {
    return res.status(400).json({ message: "Error to try create user", error });
  }
});

router.post("/validate", async (req, res) => {
  const authHeader = req.headers["authorization"];
  console.log(req.headers);
  if (!authHeader) {
    return res.status(400).json({ message: "Missing token" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = (await jwt.verify(token, SECRET_KEY)) as JwtPayload;
    return res.json({ id: decoded.id });
  } catch (error) {
    return res.status(400).json({ message: "Invalid Token" });
  }
});

export default router;
