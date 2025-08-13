import OpenAI from 'openai';

// Filipino emergency and harmful content keywords
const FILIPINO_EMERGENCY_WORDS = [
  "sunog", "sakuna", "delikado", "panganib", "aksidente", "emergency",
  "kagipitan", "saklolo", "tulong", "emergency", "baha", "lindol",
  "bagyo", "bomba", "terorista", "magnanakaw", "holdap", "patay",
  "nasugatan", "nasaktan", "nasunugan", "nasiraan", "nasaksak",
  "nabugbog", "nagkasakit", "nagkasunog", "nagkabaha", "nagkalindol"
];

interface AnalysisResult {
  riskScore: number;
  categories: string[];
  confidence: number;
  explanation: string;
}

function containsEmergencyKeywords(text: string): boolean {
  const textLower = text.toLowerCase();
  return FILIPINO_EMERGENCY_WORDS.some(word => textLower.includes(word));
}

async function analyzeText(content: string, title: string): Promise<AnalysisResult> {
  try {
    // Check for emergency keywords first
    const isEmergency = containsEmergencyKeywords(content) || containsEmergencyKeywords(title);
    
    const prompt = `Analyze the following content (title and body) for safety. The content is in English and Filipino.

    Title: "${title}"
    Content: "${content}"

    Categories to check for:
    1.  **Emergency situations**: Fires, accidents, natural disasters, etc.
    2.  **Harmful content**: Violence, self-harm, hate speech, etc.
    3.  **Community guideline violations**: Spam, harassment, etc.

    If the content contains any of the above, it is 'unsafe'. Otherwise, it is 'safe'.

    Respond with a single word: 'safe' or 'unsafe'.`;

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_TOKEN,
      baseURL: "https://api.deepseek.com/v1",
    });
    
    const response = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
            {
                role: "system",
                content: "You are a content moderator. Your task is to determine if the given text is safe or unsafe."
            },
            {
                role: "user",
                content: prompt,
            },
        ],
        max_tokens: 10,
        temperature: 0.1,
    });
    
    const responseText = response.choices[0].message.content?.trim().toLowerCase() ?? 'safe';
    const isSafe = responseText.includes("safe") && !responseText.includes("unsafe");
    
    const finalIsSafe = isSafe && !isEmergency;
    
    const riskScore = finalIsSafe ? 0.0 : 1.0;
    
    let explanation = `Content analysis determined this content is ${finalIsSafe ? 'safe' : 'unsafe'} for the following reasons:\n`;
    if (!finalIsSafe) {
      if (isEmergency) {
        explanation += "- Contains emergency-related content that needs verification\n";
      }
      explanation += "- Contains potentially inappropriate or harmful material\n";
      explanation += "- May violate community guidelines\n";
    } else {
      explanation += "- Content appears to be completely appropriate\n";
      explanation += "- No harmful material or emergency situations detected\n";
    }
    
    const categories: string[] = [];
    if (!finalIsSafe) {
      categories.push("unsafe");
      if (isEmergency) {
        categories.push("emergency");
      }
      categories.push("needs_moderation");
    } else {
      categories.push("safe");
      categories.push("verified");
    }
    
    return {
      riskScore,
      categories,
      confidence: 0.9,
      explanation
    };
    
  } catch (error) {
    console.error("Error during analysis:", error);
    return basicAnalysis(content, title);
  }
}

function basicAnalysis(content: string, title: string): AnalysisResult {
  const isEmergency = containsEmergencyKeywords(content) || containsEmergencyKeywords(title);
  
  if (isEmergency) {
    return {
      riskScore: 0.7,
      categories: ["needs_moderation", "emergency", "unsafe"],
      confidence: 0.5,
      explanation: "Using basic analysis due to API unavailability. Emergency keywords detected in content. Content requires manual review for safety."
    };
  }
  
  return {
    riskScore: 0.0,
    categories: ["safe", "verified"],
    confidence: 0.5,
    explanation: "Using basic analysis due to API unavailability. No emergency keywords detected. Content appears safe."
  };
}

export { analyzeText, basicAnalysis, containsEmergencyKeywords };
