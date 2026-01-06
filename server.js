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

app.use(cors());
app.use(express.json());

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
