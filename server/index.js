import express from "express";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

const upload = multer({ storage: multer.memoryStorage() });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/template", (_req, res) => {
  const sample =
    "User,Role,Repository,Permission,Notes\n" +
    "alice,Developer,repo-a,write,\n" +
    "bob,Admin,repo-b,admin,\n";
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=\"evidence_template.csv\"");
  res.send(sample);
});

app.post("/api/upload-excel", upload.single("excel"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.json({ bytes: req.file.size, filename: req.file.originalname });
});

app.post("/api/upload-images", upload.array("images", 20), (req, res) => {
  const files = req.files || [];
  res.json({
    count: files.length,
    totalBytes: files.reduce((n, f) => n + f.size, 0)
  });
});

app.post("/api/submit", (req, res) => {
  const submission = req.body;
  if (!submission?.application || !submission?.evidence) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  // In a real app, persist or forward to your compliance system here.
  res.json({ status: "accepted", id: `EV-${Date.now()}` });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Compliance Center server listening on http://localhost:${port}`);
});

