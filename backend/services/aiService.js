const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateContentWithFallback = async (prompt) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return await model.generateContent(prompt);
      } catch (error) {
        const isTransient = error.status === 503 || error.status === 404 || error.status === 429;
        if (isTransient) {
          console.warn(`[Attempt ${attempt}] Model ${modelName} failed with status ${error.status}. Trying next...`);
          continue;
        }
        throw error;
      }
    }
    if (attempt < 3) {
      console.warn(`All models failed on attempt ${attempt}. Waiting before retrying...`);
      await new Promise(res => setTimeout(res, 1000 * attempt)); // 1s, 2s backoff
    }
  }
  throw new Error('All Gemini models and retries failed due to high demand or unavailability.');
};

const analyzeReport = async (description) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using fallback categorization.");
    return { category: 'other', severity: 3 };
  }

  try {
    const prompt = `Analyze the following report and return JSON:
{
  "category": "one of [health, food, water, shelter, other]",
  "severity": "number from 1 to 5"
}

Text: ${description}

Return ONLY JSON, no markdown formatting.`;

    const result = await generateContentWithFallback(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown blocks
    const jsonStr = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(jsonStr);
    
    const validCategories = ['health', 'food', 'water', 'shelter', 'other'];
    const category = validCategories.includes(parsedData.category) ? parsedData.category : 'other';
    const severity = (parsedData.severity >= 1 && parsedData.severity <= 5) ? Number(parsedData.severity) : 3;

    return { category, severity };
  } catch (error) {
    console.error('Error analyzing report with Gemini:', error.message || error);
    return { category: 'other', severity: 3 };
  }
};

const extractStructuredData = async (text) => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Using fallback for unstructured data.");
    return {
      description: text,
      category: 'other',
      severity: 3,
      location: { lat: 20.5937, lng: 78.9629 }
    };
  }

  try {
    const prompt = `Convert this field report into structured JSON:
{
  "description": "string (the core issue described)",
  "category": "one of [health, food, water, shelter, other]",
  "severity": "number (1-5)",
  "location": { "lat": "number", "lng": "number" },
  "locationName": "string (name of the location if present, else empty)"
}

Text: ${text}

Return ONLY JSON, no markdown formatting.`;

    const result = await generateContentWithFallback(prompt);
    const responseText = result.response.text();
    const jsonStr = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
    
    const parsedData = JSON.parse(jsonStr);
    
    const validCategories = ['health', 'food', 'water', 'shelter', 'other'];
    const category = validCategories.includes(parsedData.category) ? parsedData.category : 'other';
    const severity = (parsedData.severity >= 1 && parsedData.severity <= 5) ? Number(parsedData.severity) : 3;
    const description = parsedData.description || text;
    
    let location = null;
    if (parsedData.location && typeof parsedData.location.lat === 'number' && typeof parsedData.location.lng === 'number') {
      location = parsedData.location;
    }
    const locationName = parsedData.locationName || null;

    return { description, category, severity, location, locationName };
  } catch (error) {
    console.error('Error extracting structured data with Gemini:', error.message || error);
    return {
      description: text.substring(0, 500),
      category: 'other',
      severity: 3,
      location: null,
      locationName: null
    };
  }
};

const rerankVolunteers = async (volunteers, areaContext) => {
  if (!process.env.GEMINI_API_KEY) {
    return volunteers;
  }
  
  try {
    const prompt = `Re-rank the following volunteers based on this area context.
Area Context:
Dominant Issue: ${areaContext.primaryNeed}
Urgency Level: ${areaContext.priorityLevel}
Average Severity: ${areaContext.avg_severity}

Volunteers:
${JSON.stringify(volunteers.map(v => ({ id: v._id, skills: v.skills, initialScore: v.score })), null, 2)}

Return ONLY a JSON array of volunteer IDs strings in priority order, no markdown.`;

    const result = await generateContentWithFallback(prompt);
    const text = result.response.text().replace(/```json/i, '').replace(/```/g, '').trim();
    const rankedIds = JSON.parse(text);
    
    const rankedVolunteers = [];
    rankedIds.forEach(id => {
      const v = volunteers.find(vol => vol._id.toString() === id);
      if (v) rankedVolunteers.push(v);
    });
    
    volunteers.forEach(v => {
      if (!rankedVolunteers.includes(v)) rankedVolunteers.push(v);
    });
    
    return rankedVolunteers;
  } catch (error) {
    console.error('Gemini reranking failed, using original ranking:', error.message || error);
    return volunteers;
  }
};

module.exports = { analyzeReport, extractStructuredData, rerankVolunteers };
