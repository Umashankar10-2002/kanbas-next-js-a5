// server/index.js
import express from "express";
import cors from "cors";
import session from "express-session";
import Lab5 from "./Lab5/index.js";
import db from "./Kambaz/db.js";
import UserRoutes from "./Kambaz/Users/routes.js";
import CourseRoutes from "./Kambaz/Courses/routes.js";
import ModulesRoutes from "./Kambaz/Modules/routes.js";
import AssignmentsRoutes from "./Kambaz/Assignments/routes.js";
import EnrollmentRoutes from "./Kambaz/Enrollments/routes.js";

const app = express();

app.use(express.json());

// ✅ IMPORTANT for Render / reverse proxies
app.set("trust proxy", 1);

// ✅ Put your Vercel URL here (no trailing slash)
const VERCEL_URL = process.env.VERCEL_URL || "https://YOUR_VERCEL_URL_HERE";

// ✅ Allow local dev + deployed frontend(s)
const allowedOrigins = [
  "http://localhost:3000",
  VERCEL_URL,
];

// ✅ CORS (must allow credentials for session cookies)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / curl (no origin) and allowed sites
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

// ✅ Session cookie settings for Vercel(frontend) -> Render(backend)
const isProduction = process.env.NODE_ENV === "production";

app.use(
  session({
    secret: process.env.SESSION_SECRET || "kambaz-secret",
    resave: false,
    saveUninitialized: false, // better for auth: only create session when needed
    cookie: {
      secure: isProduction,               // true on https (Render)
      sameSite: isProduction ? "none" : "lax", // cross-site cookie in prod
    },
  })
);

// Routes
Lab5(app);
UserRoutes(app, db);
CourseRoutes(app, db);
ModulesRoutes(app, db);
AssignmentsRoutes(app, db);
EnrollmentRoutes(app, db);

app.get("/hello", (req, res) => {
  res.send("Hello from Kambaz server");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
