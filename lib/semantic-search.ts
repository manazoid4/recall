// Simple cosine similarity for semantic search
// In production, use pgvector or sqlite-vss for better performance

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimensions mismatch: ${a.length} vs ${b.length}`);
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findTopKSimilar(
  queryVector: number[],
  candidates: Array<{ id: string; vector: number[]; metadata?: Record<string, unknown> }>,
  k: number = 10,
  minScore: number = 0.7
): Array<{ id: string; score: number; metadata?: Record<string, unknown> }> {
  const scored = candidates
    .map((candidate) => ({
      id: candidate.id,
      score: cosineSimilarity(queryVector, candidate.vector),
      metadata: candidate.metadata,
    }))
    .filter((result) => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
  
  return scored;
}

// Parse a vector from JSON string storage
export function parseVector(vectorStr: string): number[] {
  try {
    return JSON.parse(vectorStr) as number[];
  } catch {
    return [];
  }
}

// Serialize vector to JSON string
export function serializeVector(vector: number[]): string {
  return JSON.stringify(vector);
}
