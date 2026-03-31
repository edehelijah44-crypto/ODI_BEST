import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import platformsRouter from "./platforms";
import postsRouter from "./posts";
import analyticsRouter from "./analytics";
import billingRouter from "./billing";
import oauthRouter from "./oauth";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/profile", profileRouter);
router.use("/platforms", platformsRouter);
router.use("/posts", postsRouter);
router.use("/analytics", analyticsRouter);
router.use("/billing", billingRouter);
router.use("/oauth", oauthRouter);

export default router;
