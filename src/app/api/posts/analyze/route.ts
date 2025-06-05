import { NextRequest, NextResponse } from 'next/server';
import {
  generateContentHash,
  checkCache,
  cacheAnalysis,
  performAiAnalysis,
  type AnalysisCache
} from '@/app/api/backend/services/cacheService'; // Path to your cacheService

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const contentHash = generateContentHash(content, title);
    const cachedAnalysisEntry = await checkCache(contentHash);
    let analysisData: AnalysisCache['analysis'];

    if (cachedAnalysisEntry && cachedAnalysisEntry.analysis) {
      analysisData = cachedAnalysisEntry.analysis;
      // ...
    } else {
      // Perform new AI analysis
      const newAnalysis = await performAiAnalysis(title, content);
      analysisData = newAnalysis;
      if (analysisData) {
         await cacheAnalysis(contentHash, newAnalysis);
      } else {
         console.error("API Route: AI analysis failed to produce results.");
         return NextResponse.json({ error: 'AI analysis process failed to produce results' }, { status: 500 });
      }
    }
    return NextResponse.json(analysisData, { status: 200 });
  } catch (error) {
    console.error('Error in /api/posts/analyze (App Route):', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: 'Failed to analyze content', details: errorMessage }, { status: 500 });
  }
}
