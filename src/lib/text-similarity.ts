function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
}

export function jaccardSimilarity(a: string, b: string): number {
  const setA = new Set(normalize(a));
  const setB = new Set(normalize(b));

  if (setA.size === 0 && setB.size === 0) return 1;

  const intersectionSize = [...setA].filter((word) => setB.has(word)).length;
  const unionSize = new Set([...setA, ...setB]).size;

  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

export function mostSimilar(
  text: string,
  candidates: string[]
): { score: number; match?: string } {
  let best: { score: number; match?: string } = { score: 0, match: undefined };

  for (const candidate of candidates) {
    const score = jaccardSimilarity(text, candidate);
    if (score > best.score) {
      best = { score, match: candidate };
    }
  }

  return best;
}
