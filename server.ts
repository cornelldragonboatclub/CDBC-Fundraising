import express from "express";
// @ts-ignore
import submitHandler from "./api/submit.js";
// @ts-ignore
import loginHandler from "./api/admin/login.js";
// @ts-ignore
import submissionsHandler from "./api/admin/submissions.js";
// @ts-ignore
import updateHandler from "./api/admin/update.js";
// @ts-ignore
import deleteHandler from "./api/admin/delete.js";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Map the Vercel API routes for local AI Studio testing
  app.post("/api/submit", async (req, res) => {
    try {
      await submitHandler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post("/api/admin/login", async (req, res) => {
    try {
      await loginHandler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.get("/api/admin/submissions", async (req, res) => {
    try {
      await submissionsHandler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.patch("/api/admin/update", async (req, res) => {
    try {
      await updateHandler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.delete("/api/admin/delete", async (req, res) => {
    try {
      await deleteHandler(req, res);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
