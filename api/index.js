// Vercel serverless entry for the web project: serves the study backend under /api
// on the same domain as the web app, so no separate backend deployment is needed.
const express = require('express');
const backend = require('../ai-study-backend/app');

const app = express();

app.use('/api', backend);

module.exports = app;
