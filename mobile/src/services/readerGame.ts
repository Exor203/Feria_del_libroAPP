export const categories = ["Autores", "Géneros", "Editoriales", "Feria"] as const;
export type Category = (typeof categories)[number];

export type Question = {
  id: string;
  category: Category;
  prompt: string;
  correct: string;
  distractors: readonly [string, string, string, string, ...string[]];
  hint: string;
  fact: string;
};

export type Advantage = { kind: "Pista" | "50/50" } | { kind: "Tiempo extra"; seconds: number };
export const roundMs = 30_000;

export function shuffle<T>(values: readonly T[], random = Math.random): T[] {
  const shuffled = [...values];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickQuestion(
  bank: readonly Question[],
  seen: ReadonlySet<string>,
  previous?: { question: Question; options: readonly string[] },
  random = Math.random,
) {
  const available = bank.filter(question => !seen.has(question.id));
  const fresh = bank.filter(question => question.id !== previous?.question.id);
  const pool = available.length ? available : fresh.length ? fresh : bank;
  const availableCategories = categories.filter(category => pool.some(question => question.category === category));
  const category = availableCategories[Math.floor(random() * availableCategories.length)];
  const candidates = pool.filter(question => question.category === category);
  const question = candidates[Math.floor(random() * candidates.length)];
  const options = shuffle(question.distractors, random).slice(0, 3);
  const positions = [0, 1, 2, 3].filter(index => index !== previous?.options.indexOf(previous.question.correct));
  options.splice(positions[Math.floor(random() * positions.length)], 0, question.correct);
  return { question, options };
}

export function scoreAnswer(correct: boolean, elapsedMs: number, random = Math.random) {
  if (!correct) return { spaces: 0, reward: null };
  if (elapsedMs > 20_000) return { spaces: 1, reward: null };

  const fast = elapsedMs <= 10_000;
  const spaces = fast ? 3 : 2;
  if (!fast && random() >= 0.5) return { spaces, reward: null };

  const roll = random();
  let reward: Advantage;
  if (roll < 0.4) reward = { kind: "Pista" };
  else if (roll < 0.8) reward = { kind: "Tiempo extra", seconds: fast ? 10 : 5 };
  else reward = { kind: "50/50" };
  return { spaces, reward };
}

export function fiftyFifty(options: readonly string[], correct: string, random = Math.random) {
  return shuffle(options.filter(option => option !== correct), random).slice(0, 2);
}

export function advantageLabel(advantage: Advantage) {
  return advantage.kind === "Tiempo extra" ? `Tiempo extra (+${advantage.seconds} s)` : advantage.kind;
}
