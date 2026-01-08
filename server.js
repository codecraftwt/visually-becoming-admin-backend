// visually-becoming-admin-backend\server.js
// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/categories", require("./routes/categoryRoutes"));

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Manual CORS middleware (works better with Vercel serverless functions)
const allowedOrigins = [
  'https://admin.visuallybecoming.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Check if origin is allowed
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// CORS configuration (backup)
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(null, true); // Allow all in production for now, can restrict later
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: '250mb' })); // Increase limit for large file uploads
app.use(express.urlencoded({ extended: true, limit: '250mb' }));

// Sample data (in production, use a database)
let categories = [
  { id: 1, name: 'Wealth', published: true },
  { id: 2, name: 'Health', published: true },
  { id: 3, name: 'Relationships', published: true }
];

let dailyAffirmations = [];
let guidedAudio = [];
let guidedMeditations = [];
let guidedVisualizations = [];
let dailyNotifications = [];

let idCounter = 1;


// Routes
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/audio-categories", require("./routes/audioCategoryRoutes"));
app.use("/api/daily-affirmations", require("./routes/dailyAffirmationRoutes"));
app.use("/api/guided-audio", require("./routes/guidedAudioRoutes"));
app.use("/api/guided-meditations", require("./routes/guidedMeditationRoutes"));
app.use("/api/guided-visualizations", require("./routes/guidedVisualizationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/combined", require("./routes/combinedRoutes"));

// Today's content route (must be before generic :contentType route)
app.get('/api/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const todayContent = {
    date: today,
    categories: categories.filter(cat => cat.published),
    dailyAffirmations: dailyAffirmations.filter(item => item.published),
    guidedAudio: guidedAudio.filter(item => item.published),
    guidedMeditations: guidedMeditations.filter(item => item.published),
    guidedVisualizations: guidedVisualizations.filter(item => item.published),
    dailyNotifications: dailyNotifications.filter(item => item.published)
  };
  
  res.json(todayContent);
});

// Generic guided content routes (supports: audio, meditation, visualization, etc.)
// Must be after specific routes like /api/today
app.use("/api/:contentType", require("./routes/guidedContentRoutes"));

app.use(errorHandler);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Visually Becoming Admin Backend API", status: "running" });
});

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// Export for Vercel serverless functions
module.exports = app;
