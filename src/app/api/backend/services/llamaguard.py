import sys
import json
from typing import Dict, List
from huggingface_hub import InferenceClient
import os

client = InferenceClient(
    provider="hf-inference",
    api_key=os.getenv("HUGGING_FACE_HUB_TOKEN"),
    model="meta-llama/Llama-3.1-8B-Instruct"
)

# Filipino emergency and harmful content keywords, add more if needed, do txt file if we need a lot of words
FILIPINO_EMERGENCY_WORDS = [
    "sunog", "sakuna", "delikado", "panganib", "aksidente", "emergency",
    "kagipitan", "saklolo", "tulong", "emergency", "baha", "lindol",
    "bagyo", "bomba", "terorista", "magnanakaw", "holdap", "patay",
    "nasugatan", "nasaktan", "nasunugan", "nasiraan", "nasaksak",
    "nabugbog", "nagkasakit", "nagkasunog", "nagkabaha", "nagkalindol"
]

def contains_emergency_keywords(text: str) -> bool:
    text_lower = text.lower()
    return any(word in text_lower for word in FILIPINO_EMERGENCY_WORDS)

def analyze_text(content: str, title: str) -> Dict:
    try:
        # Check for emergency keywords first
        is_emergency = contains_emergency_keywords(content) or contains_emergency_keywords(title)
        
        # Prepare a more explicit prompt for content moderation with Filipino context
        prompt = f"""Content Moderation Analysis (English and Filipino):
                    Title: {title}
                    Content: {content}

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
                    Do not include any other text in your response."""

        # Make API request
        response = client.text_generation(
            prompt,
            max_new_tokens=5,
            do_sample=False,
            temperature=0.1  # Lower temperature for more deterministic responses
        )
        
        # Parse response and create analysis result
        response_text = response.strip().lower() if isinstance(response, str) else response.get("generated_text", "").strip().lower()
        is_safe = "safe" in response_text and "unsafe" not in response_text
        
        # If emergency keywords are found, mark as unsafe
        if is_emergency:
            is_safe = False
        
        risk_score = 0.0 if is_safe else 1.0
        
        # Generate a more detailed explanation
        explanation = f"Content analysis determined this content is {'safe' if is_safe else 'unsafe'} for the following reasons:\n"
        if not is_safe:
            if is_emergency:
                explanation += "- Contains emergency-related content that needs verification\n"
            explanation += "- Contains potentially inappropriate or harmful material\n"
            explanation += "- May violate community guidelines\n"
            explanation += "- Even if mixed with appropriate content, any harmful material requires flagging\n"
        else:
            explanation += "- Content appears to be completely appropriate\n"
            explanation += "- No harmful material or emergency situations detected\n"
            explanation += "- All content follows community guidelines\n"
        
        categories = []
        if not is_safe:
            categories.append("unsafe")
            if is_emergency:
                categories.append("emergency")
            categories.append("needs moderation")
        else:
            categories.append("safe")
            categories.append("verified")  # Add verified category for safe content
        
        analysis = {
            "riskScore": risk_score,
            "categories": categories,
            "confidence": 0.9,  # High confidence as Llama is deterministic
            "explanation": explanation
        }
        
        return analysis
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return basic_analysis(content, title)

def basic_analysis(content: str, title: str) -> Dict:
    """
    Fallback basic content analysis - when API is unavailable, we err on the side of caution
    and send content for human review
    """
    is_emergency = contains_emergency_keywords(content) or contains_emergency_keywords(title)
    categories = ["needs_moderation"]  # Always include needs_moderation in fallback
    
    if is_emergency:
        categories.extend(["emergency", "unsafe"])
    
    return {
        "riskScore": 0.7 if is_emergency else 0.5,  # Higher risk score for emergency content
        "categories": categories,
        "confidence": 0.5,  # Lower confidence since we're using fallback
        "explanation": "Using basic analysis due to API unavailability. Content requires manual review for safety. " + 
                      ("Emergency keywords detected in content." if is_emergency else "")
    }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Invalid arguments"}))
        sys.exit(1)
        
    content = sys.argv[1]
    title = sys.argv[2]
    
    try:
        analysis = analyze_text(content, title)
        print(json.dumps(analysis))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
