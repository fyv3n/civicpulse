import { analyzeText } from '@/app/api/backend/services/deepseekService';

interface AIAnalysisResult {
  riskScore: number;
  categories: string[];
  confidence: number;
  explanation: string;
}

export async function analyzeContent(content: string, title: string): Promise<AIAnalysisResult> {
  try {
    console.log('Starting content analysis...');
    const analysis = await analyzeText(content, title);
    console.log('Analysis completed successfully');
    return analysis;
  } catch (error) {
    console.error('Error during content analysis:', error);
    throw error;
  }
}
