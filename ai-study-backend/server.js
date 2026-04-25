const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-haiku-latest';

const SYSTEM_PROMPT = `You are an AI Study Companion. Follow these rules strictly:

1. LANGUAGE: Always respond in BOTH English and Urdu
2. FORMAT: Use this exact format:
   - First: English explanation (simple, short - 2-3 sentences)
   - Then: اردو میں وضاحت (Urdu explanation - 2-3 sentences)
   - Finally: EXAMPLE (ایک مثال دیں)

3. STYLE:
   - Use simple words, avoid technical jargon
   - Be encouraging and supportive
   - Keep explanations SHORT but clear
   - Make examples relatable to students

4. EXAMPLE FORMAT:
   English Example: [simple example in English]
   اردو میں مثال: [simple example in Urdu]

Remember: ALWAYS include BOTH languages and ONE example in every response.`;

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
    return `I could not find weather information for "${city}". Please check the city name and try again.

اردو میں وضاحت: میں "${city}" کے موسم کی معلومات نہیں ڈھونڈ سکا۔ شہر کا نام چیک کر کے دوبارہ کوشش کریں۔

English Example: Try asking, "What is the weather in Lahore?"
اردو میں مثال: پوچھیں، "Lahore ka weather kya hai?"`;
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

  return `The current weather in ${location.name} is ${current.temperature_2m}°C and feels like ${current.apparent_temperature}°C. The condition is ${condition}, with wind speed around ${current.wind_speed_10m} km/h.

اردو میں وضاحت: ${location.name} میں اس وقت درجہ حرارت ${current.temperature_2m}°C ہے اور محسوس ${current.apparent_temperature}°C جیسا ہو رہا ہے۔ موسم ${condition} ہے، اور ہوا کی رفتار تقریباً ${current.wind_speed_10m} km/h ہے۔

English Example: If it feels hot, drink water and avoid staying in direct sunlight for too long.
اردو میں مثال: اگر گرمی محسوس ہو تو پانی پئیں اور زیادہ دیر دھوپ میں نہ رہیں۔`;
}

if (!CLAUDE_API_KEY) {
  console.error('ERROR: CLAUDE_API_KEY is not set in .env file');
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

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Study Backend is running',
  });
});

app.post('/ask', async (req, res) => {
  const { question } = req.body;

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

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
        },
      },
    );

    const answer =
      response.data?.content?.find((item) => item.type === 'text')?.text ||
      'Sorry, I could not generate an answer. Please try again.';

    return res.json({ answer });
  } catch (error) {
    console.error('Claude API Error:', error.response?.data || error.message);

    return res.status(500).json({
      error: 'Failed to get AI response',
    });
  }
});

app.listen(PORT, () => {
  console.log(`AI Study Backend running on http://localhost:${PORT}`);
  console.log(`Ask endpoint ready at http://localhost:${PORT}/ask`);
});