import { InferenceClient } from '@huggingface/inference';

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
    
    // Prepare a more explicit prompt for content moderation with Filipino context
    const prompt = `Content Moderation Analysis (English and Filipino):
                  Title: ${title}
                  Content: ${content}

                  Please analyze this content for:
                  1. Emergency situations (e.g., fires, accidents, disasters)
                  2. Inappropriate or harmful material
                  3. Hate speech or discrimination
                  4. Violence or threats
                  5. Harassment or bullying

                  Consider both English and Filipino/Tagalog content.
                  Emergency words in Filipino: sunog, sakuna, delikado, panganib, aksidente, etc.

                  Important: If ANY part of the content contains harmful material or describes an emergency situation,
                  even if mixed with appropriate content, the entire post should be considered unsafe.

                  Respond with ONLY one word: 'safe' if the content is completely appropriate, or 'unsafe' if it contains
                  ANY harmful material or describes an emergency situation.
                  Do not include any other text in your response.`;

    // Initialize HuggingFace client
    const hf = new InferenceClient(process.env.HUGGING_FACE_HUB_TOKEN);
    
    // Make API request
    const response = await hf.textGeneration({
      model: "meta-llama/Llama-3.1-8B-Instruct",
      inputs: prompt,
      parameters: {
        max_new_tokens: 5,
        temperature: 0.1 // Lower temperature for more deterministic responses
      }
    });
    
    // Parse response and create analysis result
    const responseText = response.generated_text.trim().toLowerCase();
    const isSafe = responseText.includes("safe") && !responseText.includes("unsafe");
    
    // If emergency keywords are found, mark as unsafe
    const finalIsSafe = isSafe && !isEmergency;
    
    const riskScore = finalIsSafe ? 0.0 : 1.0;
    
    // Generate a more detailed explanation
    let explanation = `Content analysis determined this content is ${finalIsSafe ? 'safe' : 'unsafe'} for the following reasons:\n`;
    if (!finalIsSafe) {
      if (isEmergency) {
        explanation += "- Contains emergency-related content that needs verification\n";
      }
      explanation += "- Contains potentially inappropriate or harmful material\n";
      explanation += "- May violate community guidelines\n";
      explanation += "- Even if mixed with appropriate content, any harmful material requires flagging\n";
    } else {
      explanation += "- Content appears to be completely appropriate\n";
      explanation += "- No harmful material or emergency situations detected\n";
      explanation += "- All content follows community guidelines\n";
    }
    
    const categories: string[] = [];
    if (!finalIsSafe) {
      categories.push("unsafe");
      if (isEmergency) {
        categories.push("emergency");
      }
      categories.push("needs moderation");
    } else {
      categories.push("safe");
      categories.push("verified"); // Add verified category for safe content
    }
    
    return {
      riskScore,
      categories,
      confidence: 0.9, // High confidence as Llama is deterministic
      explanation
    };
    
  } catch (error) {
    console.error("Error during analysis:", error);
    return basicAnalysis(content, title);
  }
}

function basicAnalysis(content: string, title: string): AnalysisResult {
  // Fallback basic content analysis - when API is unavailable, we err on the side of caution
  // and send content for human review
  const isEmergency = containsEmergencyKeywords(content) || containsEmergencyKeywords(title);
  const categories = ["needs_moderation"]; // Always include needs_moderation in fallback
  
  if (isEmergency) {
    categories.push("emergency", "unsafe");
  }
  
  return {
    riskScore: isEmergency ? 0.7 : 0.5, // Higher risk score for emergency content
    categories,
    confidence: 0.5, // Lower confidence since we're using fallback
    explanation: "Using basic analysis due to API unavailability. Content requires manual review for safety. " + 
                (isEmergency ? "Emergency keywords detected in content." : "")
  };
}

export { analyzeText, basicAnalysis, containsEmergencyKeywords }; 