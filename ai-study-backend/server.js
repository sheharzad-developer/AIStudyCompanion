const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

const SYSTEM_PROMPT = `You are an AI Study Companion for students.

========================================
ROLE
========================================
- Act like a friendly and supportive teacher
- Help students understand concepts easily

========================================
INSTRUCTIONS
========================================
1. Explain the topic in very simple English
2. Mix a little Urdu ONLY where it improves understanding
3. Keep explanation between 100-130 words
4. Avoid complex jargon and difficult sentences
5. If the explanation feels confusing, simplify it further
6. Prefer bullet points instead of long paragraphs when helpful

========================================
REQUIRED OUTPUT FORMAT (STRICT)
========================================

Explanation:
- <simple explanation in bullet points or short lines>

Example:
- <exactly ONE real-life example>

Follow-up:
- Do you want:
  1) A simpler explanation
  2) A quiz
  3) Translation in Urdu

========================================
QUIZ MODE (ONLY IF USER ASKS)
========================================
If the user requests a quiz:

- Generate exactly 3 MCQs
- Each question must have:
  A) option
  B) option
  C) option
- Clearly mark the correct answer

Format:

Question 1:
A)
B)
C)
Answer:

(repeat for 3 questions)

========================================
IMPORTANT RULES
========================================
- Do NOT write long paragraphs
- Do NOT skip sections
- Do NOT give more than one example
- Keep everything beginner-friendly`;

const MCQ_PROMPT = `You are an AI Study Companion for students.

Create exactly 3 MCQs from the given topic.

Rules:
- Each question has 3 options
- Use A), B), and C)
- Clearly mark the correct answer
- Keep questions simple
- Make it suitable for beginner students
- Do not add explanations unless the user asks

Format exactly like this:

Question 1:
A)
B)
C)
Answer:`;

function getWeatherCodeDescription(code) {
  const weatherCodes = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'cloudy',
    45: 'foggy',
    48: 'foggy',
    51: 'light drizzle',
    53: 'drizzle',
    55: 'heavy drizzle',
    61: 'light rain',
    63: 'rain',
    65: 'heavy rain',
    71: 'light snow',
    73: 'snow',
    75: 'heavy snow',
    80: 'light rain showers',
    81: 'rain showers',
    82: 'heavy rain showers',
    95: 'thunderstorm',
  };

  return weatherCodes[code] || 'weather information available';
}

function getWeatherCity(question) {
  const isWeatherQuestion = /weather|temperature|موسم/i.test(question);

  if (!isWeatherQuestion) {
    return null;
  }

  const cityMatch = question.match(/\b(?:in|for|at)\s+([a-zA-Z\s]+?)(?:[?.,!]|$)/i);
  return cityMatch?.[1]?.trim() || 'Lahore';
}

async function getWeatherAnswer(question) {
  const city = getWeatherCity(question);

  if (!city) {
    return null;
  }

  const geoResponse = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
    params: {
      name: city,
      count: 1,
      language: 'en',
      format: 'json',
    },
  });

  const location = geoResponse.data?.results?.[0];

  if (!location) {
    return `Explanation:
- I could not find weather information for "${city}".
- Please check the city spelling and try again.
- Agar city name wrong ho, weather service result nahi de sakti.

Example:
- Try asking, "What is the weather in Lahore?"

Follow-up:
- Do you want:
  1) A simpler explanation
  2) A quiz
  3) Translation in Urdu`;
  }

  const weatherResponse = await axios.get('https://api.open-meteo.com/v1/forecast', {
    params: {
      latitude: location.latitude,
      longitude: location.longitude,
      current: 'temperature_2m,apparent_temperature,weather_code,wind_speed_10m',
      timezone: 'auto',
    },
  });

  const current = weatherResponse.data?.current;

  if (!current) {
    throw new Error('Weather API did not return current weather');
  }

  const condition = getWeatherCodeDescription(current.weather_code);

  return `Explanation:
- The current weather in ${location.name} is ${current.temperature_2m}°C.
- It feels like ${current.apparent_temperature}°C.
- The sky condition is ${condition}.
- Wind speed is around ${current.wind_speed_10m} km/h.
- Urdu: Agar weather hot feel ho, pani peena helpful hota hai.

Example:
- If it feels hot outside, carry water before going to class.

Follow-up:
- Do you want:
  1) A simpler explanation
  2) A quiz
  3) Translation in Urdu`;
}

async function generateMcqs(topic) {
  return askGemini(MCQ_PROMPT, `Topic: ${topic}`);
}

async function askGemini(systemPrompt, userContent) {
  const response = await axios.post(
    `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`,
    {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userContent }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 700,
      },
    },
    {
      params: {
        key: GEMINI_API_KEY,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const text = response.data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n');

  return text || 'Sorry, I could not generate a response. Please try again.';
}

function buildConversationContext(question, conversationHistory) {
  if (!Array.isArray(conversationHistory)) {
    return question;
  }

  const recentMessages = conversationHistory
    .filter((message) => message && typeof message.text === 'string' && message.text.trim())
    .slice(-6)
    .map((message) => {
      const role = message.role === 'user' ? 'Student' : 'Tutor';
      return `${role}: ${message.text.trim()}`;
    });

  if (recentMessages.length === 0) {
    return question;
  }

  return `Recent conversation:
${recentMessages.join('\n')}

Latest student question:
${question}`;
}

function getGeminiErrorMessage(error) {
  const geminiMessage = error.response?.data?.error?.message;

  if (geminiMessage?.toLowerCase().includes('api key not valid')) {
    return 'The Gemini API key is invalid. Please check your GEMINI_API_KEY and try again.';
  }

  if (geminiMessage?.toLowerCase().includes('quota')) {
    return 'Gemini quota is unavailable right now. Please check billing or quota in Google Cloud.';
  }

  return geminiMessage || 'Failed to get AI response';
}

if (!GEMINI_API_KEY) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env file');
  process.exit(1);
}

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '10mb' }));

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(['/ask', '/quiz'], aiLimiter);

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Study Backend is running',
  });
});

app.post('/ask', async (req, res) => {
  const { question, conversationHistory } = req.body;

  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      error: 'Question is required',
    });
  }

  try {
    const weatherAnswer = await getWeatherAnswer(question);

    if (weatherAnswer) {
      return res.json({ answer: weatherAnswer });
    }

    const answer = await askGemini(
      SYSTEM_PROMPT,
      buildConversationContext(question, conversationHistory),
    );

    return res.json({ answer });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: getGeminiErrorMessage(error),
    });
  }
});

app.post('/quiz', async (req, res) => {
  const { topic } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({
      error: 'Topic is required',
    });
  }

  try {
    const quiz = await generateMcqs(topic);

    return res.json({ quiz });
  } catch (error) {
    console.error('Gemini Quiz Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: getGeminiErrorMessage(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Study Backend running on http://localhost:${PORT}`);
  console.log(`Ask endpoint ready at http://localhost:${PORT}/ask`);
  console.log(`Quiz endpoint ready at http://localhost:${PORT}/quiz`);
});