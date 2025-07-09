import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { createHash } from 'crypto';
import { analyzeText } from '@/app/api/backend/services/llamaguard';

export interface AnalysisCache {
  contentHash: string;
  analysis: {
    riskScore: number;
    categories: string[];
    confidence: number;
    explanation: string;
  };
  timestamp: Date;
  postCount: number;
  verificationStatus: 'pending' | 'verified' | 'false_alarm';
  verifiedBy?: string;
  verificationTimestamp?: Date;
}

export function generateContentHash(content: string, title: string): string {
  // Normalize the content and title
  const normalizedContent = content.toLowerCase().trim();
  const normalizedTitle = title.toLowerCase().trim();
  
  // Extract key emergency words and location indicators in both English and Filipino
  const emergencyWords = [
    'fire', 'emergency', 'urgent', 'danger', 'hazard', 'accident',
    'sunog', 'sakuna', 'delikado', 'panganib', 'aksidente', 'emergency',
    'kagipitan', 'saklolo', 'tulong', 'emergency'
  ];
  
  const locationIndicators = [
    'in', 'at', 'near', 'around', 'close to',
    'sa', 'malapit sa', 'bandang', 'nasa', 'dito sa', 'doon sa'
  ];
  
  const commonWords = [
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'ang', 'mga', 'sa', 'ng', 'at', 'o', 'pero', 'kung', 'para', 'sa', 'ay', 'si', 'sina',
    'ni', 'nina', 'kay', 'kina', 'may', 'mayroon', 'wala', 'hindi', 'di', 'ay'
  ];
  
  // Check if this is an emergency post
  const isEmergency = emergencyWords.some(word => 
    normalizedContent.includes(word) || normalizedTitle.includes(word)
  );
  
  if (isEmergency) {
    // For emergency posts, create a more general hash that ignores specific locations
    const words = normalizedContent.split(/\s+/);
    const filteredWords = words.filter(word => 
      !locationIndicators.includes(word) && 
      !commonWords.includes(word)
    );
    
    // Sort words to ensure same hash regardless of word order
    const sortedWords = filteredWords.sort();
    return createHash('sha256').update(sortedWords.join(' ')).digest('hex');
  }
  
  // For non-emergency posts, use the original exact matching
  const combinedContent = `${normalizedTitle}:${normalizedContent}`;
  return createHash('sha256').update(combinedContent).digest('hex');
}

export async function checkCache(contentHash: string): Promise<AnalysisCache | null> {
  try {
    console.log('Checking cache for content hash:', contentHash);
    const cacheRef = adminDb.collection("analysisCache").doc(contentHash);
    const cacheDoc = await cacheRef.get();
    
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data() as AnalysisCache;
      
      // If it's a false alarm, don't use the cache
      if (cacheData.verificationStatus === 'false_alarm') {
        console.log('Cache entry marked as false alarm - ignoring cache');
        return null;
      }
      
      console.log('Cache HIT - Found existing analysis');
      return cacheData;
    } else {
      console.log('Cache MISS - No existing analysis found');
      return null;
    }
  } catch (error) {
    console.error("Error checking cache:", error);
    return null;
  }
}

export async function cacheAnalysis(contentHash: string, analysis: AnalysisCache['analysis']): Promise<void> {
  try {
    console.log('Caching new analysis for content hash:', contentHash);
    const cacheRef = adminDb.collection("analysisCache").doc(contentHash);
    await cacheRef.set({
      contentHash,
      analysis,
      timestamp: new Date(),
      postCount: 1,
      verificationStatus: 'pending' // New emergency claims start as pending
    });
    console.log('Successfully cached analysis');
  } catch (error) {
    console.error("Error caching analysis:", error);
    throw error;
  }
}

export async function updateCacheUsage(contentHash: string): Promise<void> {
  try {
    console.log('Updating cache usage count for:', contentHash);
    const cacheRef = adminDb.collection("analysisCache").doc(contentHash);
    await cacheRef.update({
      postCount: FieldValue.increment(1),
      timestamp: new Date()
    });
    console.log('Successfully updated cache usage');
  } catch (error) {
    console.error("Error updating cache usage:", error);
    throw error;
  }
}

export async function markAsFalseAlarm(contentHash: string, verifiedBy: string): Promise<void> {
  try {
    console.log('Marking cache entry as false alarm:', contentHash);
    const cacheRef = adminDb.collection("analysisCache").doc(contentHash);
    await cacheRef.update({
      verificationStatus: 'false_alarm',
      verifiedBy,
      verificationTimestamp: new Date()
    });
    console.log('Successfully marked as false alarm');
  } catch (error) {
    console.error("Error marking as false alarm:", error);
    throw error;
  }
}

export async function verifyEmergency(contentHash: string, verifiedBy: string): Promise<void> {
  try {
    console.log('Verifying emergency in cache:', contentHash);
    const cacheRef = adminDb.collection("analysisCache").doc(contentHash);
    await cacheRef.update({
      verificationStatus: 'verified',
      verifiedBy,
      verificationTimestamp: new Date()
    });
    console.log('Successfully verified emergency');
  } catch (error) {
    console.error("Error verifying emergency:", error);
    throw error;
  }
}

export async function cleanupCache(): Promise<void> {
  try {
    const CACHE_EXPIRY_DAYS = 30;
    const MIN_USAGE_COUNT = 5;
    
    const cacheCollection = adminDb.collection("analysisCache");
    const now = new Date();
    const expiryDate = new Date(now.getTime() - (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
    
    const querySnapshot = await cacheCollection
      .where("timestamp", "<", expiryDate)
      .where("postCount", "<", MIN_USAGE_COUNT)
      .get();

    const batch = adminDb.batch();
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error cleaning up cache:", error);
    throw error;
  }
}

export async function performAiAnalysis(
  title: string,
  content: string
): Promise<AnalysisCache['analysis']> {
  console.log(`(CacheService) Initiating AI analysis for title: "${title}"`);

  try {
    const analysis = await analyzeText(content, title);
    
    // If the content is flagged as unsafe, ensure it's marked for moderation
    if (analysis.riskScore > 0.5 || analysis.categories.includes("unsafe")) {
      analysis.categories = [...new Set([...analysis.categories, "needs_moderation"])];
      analysis.explanation += "\nThis content has been flagged for human moderation review.";
    }
    
    return analysis;
  } catch (error) {
    console.error('Failed to perform AI analysis:', error);
    return {
      riskScore: 0.5,
      categories: ["error", "analysis_failed"],
      confidence: 0.0,
      explanation: `AI analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
