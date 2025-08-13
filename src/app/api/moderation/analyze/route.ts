import { NextRequest, NextResponse } from 'next/server';
import { analyzeContent } from '../../backend/services/aiService';
import { 
  checkCache, 
  cacheAnalysis, 
  generateContentHash, 
  updateCacheUsage,
} from '../../backend/services/cacheService';

export async function POST(req: NextRequest) {
  try {
    const { content, title } = await req.json();

    if (!content || !title) {
      return NextResponse.json({ error: 'Content and title are required' }, { status: 400 });
    }

    // Generate content hash
    const contentHash = generateContentHash(content, title);

    // Check cache first
    const cachedAnalysis = await checkCache(contentHash);
    if (cachedAnalysis) {
      // Update cache usage
      await updateCacheUsage(contentHash);
      return NextResponse.json({
        ...cachedAnalysis.analysis,
        _cache: {
          hit: true,
          contentHash,
          timestamp: cachedAnalysis.timestamp,
          usageCount: cachedAnalysis.postCount + 1,
          verificationStatus: cachedAnalysis.verificationStatus,
          verifiedBy: cachedAnalysis.verifiedBy,
          verificationTimestamp: cachedAnalysis.verificationTimestamp
        }
      });
    }

    // If not in cache, perform analysis
    const analysis = await analyzeContent(content, title);
    
    // Cache the analysis
    await cacheAnalysis(contentHash, analysis);
    
    return NextResponse.json({
      ...analysis,
      _cache: {
        hit: false,
        contentHash,
        timestamp: new Date(),
        usageCount: 1,
        verificationStatus: 'pending'
      }
    });
  } catch (error) {
    console.error('Error analyzing content:', error);
    return NextResponse.json({ error: 'Failed to analyze content' }, { status: 500 });
  }
}
