const app = require('./app');

const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`AI Study Backend running on http://localhost:${PORT}`);
  console.log(`Ask endpoint ready at http://localhost:${PORT}/ask`);
  console.log(`Quiz endpoint ready at http://localhost:${PORT}/quiz`);
});
