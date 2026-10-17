const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

if (!GROQ_API_KEY) {
  // Vercel: surface this in the function logs, do not exit the process —
  // exiting the worker would mark the deployment unhealthy on every cold start.
  console.error('ERROR: GROQ_API_KEY is not set');
}

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
  return askAI(MCQ_PROMPT, `Topic: ${topic}`);
}

async function askAI(systemPrompt, userContent) {
  const response = await axios.post(
    `${GROQ_API_URL}/chat/completions`,
    {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      // gpt-oss is a reasoning model; reasoning tokens count toward this limit.
      reasoning_effort: 'low',
      max_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const text = response.data?.choices?.[0]?.message?.content;

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

function getAIErrorMessage(error) {
  const status = error.response?.status;
  const apiMessage = error.response?.data?.error?.message;

  if (status === 401) {
    return 'The Groq API key is invalid. Please check your GROQ_API_KEY and try again.';
  }

  if (status === 429) {
    return 'Groq rate limit reached. Please wait a moment and try again.';
  }

  return apiMessage || 'Failed to get AI response';
}

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);

app.use(express.json({ limit: '10mb' }));

// In-memory rate limiter is unreliable on serverless platforms (Vercel, Lambda)
// because counters do not persist across cold starts. For production, swap the
// store to a shared cache such as Vercel KV or Upstash Redis.
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

    const answer = await askAI(
      SYSTEM_PROMPT,
      buildConversationContext(question, conversationHistory),
    );

    return res.json({ answer });
  } catch (error) {
    console.error('AI API Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: getAIErrorMessage(error),
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
    console.error('AI Quiz Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: getAIErrorMessage(error),
    });
  }
});

module.exports = app;
