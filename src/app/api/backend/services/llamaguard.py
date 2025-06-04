import sys
import json
from typing import Dict, List
from huggingface_hub import InferenceClient
import os

# Initialize the inference client
client = InferenceClient(
    provider="hf-inference",
    api_key=os.getenv("HUGGING_FACE_HUB_TOKEN"),
    model="meta-llama/Llama-3.1-8B-Instruct"
)

def analyze_text(content: str, title: str) -> Dict:
    try:
        # Prepare a more explicit prompt for content moderation
        prompt = f"""Content Moderation Analysis:
                    Title: {title}
                    Content: {content}

                    Please analyze this content for inappropriate or harmful material. Consider:
                    1. Explicit sexual content
                    2. Hate speech or discrimination
                    3. Violence or threats
                    4. Harassment or bullying
                    5. Other harmful content

                    Important: If ANY part of the content contains harmful material, even if mixed with appropriate content, the entire post should be considered unsafe.

                    Respond with ONLY one word: 'safe' if the content is completely appropriate, or 'unsafe' if it contains ANY harmful material.
                    Do not include any other text in your response."""

        # Make API request
        response = client.text_generation(
            prompt,
            max_new_tokens=5,  # We only need one word
            do_sample=False,
            temperature=0.1  # Lower temperature for more deterministic responses
        )
        
        # Parse response and create analysis result
        response_text = response.strip().lower() if isinstance(response, str) else response.get("generated_text", "").strip().lower()
        is_safe = "safe" in response_text and "unsafe" not in response_text
        risk_score = 0.0 if is_safe else 1.0
        
        # Generate a more detailed explanation
        explanation = f"Content analysis determined this content is {'safe' if is_safe else 'unsafe'} for the following reasons:\n"
        if not is_safe:
            explanation += "- Contains potentially inappropriate or harmful material\n"
            explanation += "- May violate community guidelines\n"
            explanation += "- Even if mixed with appropriate content, any harmful material requires flagging\n"
        else:
            explanation += "- Content appears to be completely appropriate\n"
            explanation += "- No harmful material detected\n"
            explanation += "- All content follows community guidelines\n"
        
        analysis = {
            "riskScore": risk_score,
            "categories": ["unsafe"] if not is_safe else ["safe"],
            "confidence": 0.9,  # High confidence as Llama is deterministic
            "explanation": explanation
        }
        
        return analysis
        
    except Exception as e:
        print(f"Error during analysis: {str(e)}")
        return basic_analysis(content, title)

def basic_analysis(content: str, title: str) -> Dict:
    """
    Fallback basic content analysis
    """
    return {
        "riskScore": 0.5,
        "categories": ["general"],
        "confidence": 0.8,
        "explanation": "Using basic analysis due to API unavailability"
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
