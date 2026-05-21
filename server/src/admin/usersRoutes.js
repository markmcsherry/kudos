import express from "express";
import { listUsers } from "./userDirectoryService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await listUsers({
      page: req.query.page,
      pageSize: req.query.pageSize,
      search: req.query.search,
      status: req.query.status
    });

    return res.json(result);
  } catch {
    return res.status(500).json({ error: "Unable to load users." });
  }
});

export default router;
