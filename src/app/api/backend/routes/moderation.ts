import express, { Request, Response, RequestHandler } from 'express';
import { analyzeContent } from '../services/llamaService';
import { 
  checkCache, 
  cacheAnalysis, 
  generateContentHash, 
  updateCacheUsage,
  markAsFalseAlarm,
  verifyEmergency
} from '../services/cacheService';

const router = express.Router();

// test route
router.get('/test', ((req: Request, res: Response) => {
  res.json({ message: 'Moderation route is working' });
}) as RequestHandler);

router.post('/analyze', (async (req: Request, res: Response) => {
  try {
    const { content, title } = req.body;

    if (!content || !title) {
      return res.status(400).json({ error: 'Content and title are required' });
    }

    // Generate content hash
    const contentHash = generateContentHash(content, title);

    // Check cache first
    const cachedAnalysis = await checkCache(contentHash);
    if (cachedAnalysis) {
      // Update cache usage
      await updateCacheUsage(contentHash);
      return res.json({
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
    
    res.json({
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
    res.status(500).json({ error: 'Failed to analyze content' });
  }
}) as RequestHandler);

// New endpoint to verify an emergency
router.post('/verify', (async (req: Request, res: Response) => {
  try {
    const { contentHash, verifiedBy } = req.body;

    if (!contentHash || !verifiedBy) {
      return res.status(400).json({ error: 'Content hash and verifier ID are required' });
    }

    await verifyEmergency(contentHash, verifiedBy);
    res.json({ message: 'Emergency verified successfully' });
  } catch (error) {
    console.error('Error verifying emergency:', error);
    res.status(500).json({ error: 'Failed to verify emergency' });
  }
}) as RequestHandler);

// New endpoint to mark as false alarm
router.post('/false-alarm', (async (req: Request, res: Response) => {
  try {
    const { contentHash, verifiedBy } = req.body;

    if (!contentHash || !verifiedBy) {
      return res.status(400).json({ error: 'Content hash and verifier ID are required' });
    }

    await markAsFalseAlarm(contentHash, verifiedBy);
    res.json({ message: 'Marked as false alarm successfully' });
  } catch (error) {
    console.error('Error marking false alarm:', error);
    res.status(500).json({ error: 'Failed to mark as false alarm' });
  }
}) as RequestHandler);

export default router;
