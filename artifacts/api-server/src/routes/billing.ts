import { Router, type IRouter } from "express";
import { db, subscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const DEMO_USER_ID = 1;

const PLAN_LIMITS: Record<string, {
  postsLimit: number;
  platformsLimit: number;
  schedulingEnabled: boolean;
  analyticsEnabled: boolean;
}> = {
  free: { postsLimit: 5, platformsLimit: 2, schedulingEnabled: false, analyticsEnabled: false },
  starter: { postsLimit: 30, platformsLimit: 3, schedulingEnabled: true, analyticsEnabled: false },
  pro: { postsLimit: 200, platformsLimit: 5, schedulingEnabled: true, analyticsEnabled: true },
  business: { postsLimit: -1, platformsLimit: -1, schedulingEnabled: true, analyticsEnabled: true },
};

router.get("/subscription", async (req, res) => {
  try {
    let sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, DEMO_USER_ID)).limit(1);

    if (sub.length === 0) {
      await db.insert(subscriptionsTable).values({
        userId: DEMO_USER_ID,
        plan: "free",
        status: "active",
        cancelAtPeriodEnd: false,
      });
      sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, DEMO_USER_ID)).limit(1);
    }

    const s = sub[0];
    const limits = PLAN_LIMITS[s.plan] || PLAN_LIMITS.free;

    return res.json({
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd?.toISOString() ?? null,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      ...limits,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting subscription");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/upgrade", async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLAN_LIMITS[plan]) {
      return res.status(400).json({ error: "Invalid plan" });
    }

    // In production: create a Stripe checkout session here
    // For now, directly update the subscription (demo mode)
    const sub = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.userId, DEMO_USER_ID)).limit(1);

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    if (sub.length === 0) {
      await db.insert(subscriptionsTable).values({
        userId: DEMO_USER_ID,
        plan,
        status: "active",
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });
    } else {
      await db.update(subscriptionsTable).set({
        plan,
        status: "active",
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      }).where(eq(subscriptionsTable.userId, DEMO_USER_ID));
    }

    return res.json({
      plan,
      checkoutUrl: null,
      message: `Successfully upgraded to ${plan} plan!`,
    });
  } catch (err) {
    req.log.error({ err }, "Error upgrading subscription");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/cancel", async (req, res) => {
  try {
    await db.update(subscriptionsTable).set({
      cancelAtPeriodEnd: true,
      updatedAt: new Date(),
    }).where(eq(subscriptionsTable.userId, DEMO_USER_ID));

    return res.json({ success: true, message: "Subscription will be canceled at the end of the billing period." });
  } catch (err) {
    req.log.error({ err }, "Error canceling subscription");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
