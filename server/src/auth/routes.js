import express from "express";
import passport from "./passport.js";
import { createUser } from "./userStore.js";

const router = express.Router();

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Email format is invalid." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const created = await createUser({ firstName, lastName, email, password });
    if (!created) {
      return res.status(409).json({ error: "An account with that email already exists." });
    }

    return res.status(201).json({ user: created });
  } catch {
    return res.status(500).json({ error: "Unable to register right now." });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (authError, user) => {
    if (authError) {
      return next(authError);
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    return req.logIn(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      return res.json({ user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    req.session.destroy(() => {
      res.json({ status: "ok" });
    });
    return undefined;
  });
});

router.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({ user: req.user });
});

export default router;
