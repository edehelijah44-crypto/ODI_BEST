import { Router, type IRouter } from "express";
import { db, usersTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

const DEMO_USER = {
  id: "1",
  email: "demo@socialconnect.app",
  name: "ODI BEST ETT",
  avatar: null,
  createdAt: new Date().toISOString(),
};

function formatUser(u: any) {
  return {
    id: String(u.id),
    email: u.email || "",
    name: u.name,
    avatar: u.avatar,
    createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
  };
}

// GET /api/auth/me — returns current user
router.get("/me", async (req, res) => {
  try {
    const session = (req as any).session;
    if (session?.userId) {
      const users = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
      if (users.length > 0) return res.json(formatUser(users[0]));
    }
    if (req.headers["x-demo-mode"] === "true") return res.json(DEMO_USER);
    return res.status(401).json({ error: "Unauthorized" });
  } catch (err) {
    req.log.error({ err }, "Error getting user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/register — create new account
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters." });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    
    // Check if email already exists
    const existing = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const inserted = await db.insert(usersTable).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    } as any).returning();

    const user = inserted[0];

    // Create profile automatically
    await db.insert(profilesTable).values({
      userId: user.id,
      displayName: user.name,
      bio: "",
      website: "",
      avatar: null,
    } as any).onConflictDoNothing();

    // Start session
    (req as any).session.userId = user.id;
    (req as any).session.save(() => {
      return res.status(201).json(formatUser(user));
    });
  } catch (err) {
    req.log.error({ err }, "Error registering user");
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/login — sign in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const users = await db.select().from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (users.length === 0) {
      return res.status(401).json({ error: "No account found with this email." });
    }

    const user = users[0] as any;

    if (!user.passwordHash) {
      return res.status(401).json({ error: "This account uses a different sign-in method." });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Incorrect password. Please try again." });
    }

    (req as any).session.userId = user.id;
    (req as any).session.save(() => {
      return res.json(formatUser(user));
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/logout — sign out
router.post("/logout", (req, res) => {
  (req as any).session.destroy(() => {
    res.json({ success: true });
  });
});

// POST /api/auth/change-password
router.post("/change-password", async (req, res) => {
  try {
    const session = (req as any).session;
    if (!session?.userId) return res.status(401).json({ error: "Not authenticated." });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both current and new password are required." });
    if (newPassword.length < 8) return res.status(400).json({ error: "New password must be at least 8 characters." });

    const users = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!users.length) return res.status(404).json({ error: "User not found." });

    const user = users[0] as any;
    if (!user.passwordHash) return res.status(400).json({ error: "No password set on this account." });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    const newHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash: newHash } as any).where(eq(usersTable.id, session.userId));

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (err) {
    req.log.error({ err }, "Error changing password");
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// In-memory passkey challenge store (use Redis in production)
const passkeyStore = new Map<number, { challenge: string; userId: number }>();

// POST /api/auth/passkey/register/options — generate WebAuthn registration options
router.post("/passkey/register/options", async (req, res) => {
  try {
    const session = (req as any).session;
    if (!session?.userId) return res.status(401).json({ error: "Not authenticated." });

    const users = await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1);
    if (!users.length) return res.status(404).json({ error: "User not found." });
    const user = users[0];

    const challenge = Buffer.from(crypto.randomBytes(32)).toString("base64url");
    passkeyStore.set(session.userId, { challenge, userId: session.userId });

    return res.json({
      challenge,
      userId: String(user.id),
      userEmail: user.email || "",
      userName: user.name,
    });
  } catch (err) {
    req.log.error({ err }, "Error generating passkey options");
    return res.status(500).json({ error: "Something went wrong." });
  }
});

// POST /api/auth/passkey/register/verify — store the passkey credential
router.post("/passkey/register/verify", async (req, res) => {
  try {
    const session = (req as any).session;
    if (!session?.userId) return res.status(401).json({ error: "Not authenticated." });

    const { credentialId, clientDataJSON, attestationObject } = req.body;
    if (!credentialId || !clientDataJSON) return res.status(400).json({ error: "Missing credential data." });

    // Verify the challenge
    const stored = passkeyStore.get(session.userId);
    if (!stored) return res.status(400).json({ error: "No pending registration. Please try again." });

    const clientData = JSON.parse(Buffer.from(clientDataJSON, "base64").toString("utf-8"));
    const receivedChallenge = clientData.challenge;
    if (receivedChallenge !== stored.challenge) {
      return res.status(400).json({ error: "Challenge mismatch. Please try again." });
    }

    passkeyStore.delete(session.userId);

    // Store credential ID in user record (simplified — production should store full public key)
    const existing = (await db.select().from(usersTable).where(eq(usersTable.id, session.userId)).limit(1))[0] as any;
    const credentials = JSON.parse(existing.passkeyCredentials || "[]");
    credentials.push({ id: credentialId, createdAt: new Date().toISOString() });
    await db.update(usersTable).set({ passkeyCredentials: JSON.stringify(credentials) } as any).where(eq(usersTable.id, session.userId));

    return res.json({ success: true, message: "Passkey registered successfully." });
  } catch (err) {
    req.log.error({ err }, "Error verifying passkey");
    return res.status(500).json({ error: "Something went wrong." });
  }
});

import crypto from "crypto";

export default router;
