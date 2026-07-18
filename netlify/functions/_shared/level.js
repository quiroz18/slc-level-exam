const { ANSWER_KEY, TOTAL_QUESTIONS } = require('./examData');

// SLC level cutoffs across 50 questions, as specified by the institute.
function levelFromScore(score, total) {
  // Scale to a 50-question basis in case total ever differs.
  const scaled = total === 50 ? score : Math.round((score / total) * 50);
  if (scaled <= 18) return 'Level Intro';
  if (scaled <= 25) return 'Level 1';
  if (scaled <= 32) return 'Level 2';
  if (scaled <= 39) return 'Level 3';
  if (scaled <= 46) return 'Level 4';
  return 'Level 5';
}

// Grades a submitted answers object { "1": "b", "2": "a", ... } and
// returns score, total, level, and a per-category breakdown.
function gradeAnswers(answers) {
  let score = 0;
  const breakdown = {}; // category -> { correct, total }

  for (const item of ANSWER_KEY) {
    const given = answers[String(item.id)];
    const isCorrect = given === item.correct;
    if (isCorrect) score += 1;

    if (!breakdown[item.category]) {
      breakdown[item.category] = { correct: 0, total: 0 };
    }
    breakdown[item.category].total += 1;
    if (isCorrect) breakdown[item.category].correct += 1;
  }

  return {
    score,
    total: TOTAL_QUESTIONS,
    level: levelFromScore(score, TOTAL_QUESTIONS),
    topic_breakdown: breakdown,
  };
}

// Teaching suggestions per category, used to build the report text.
const TEACHING_NOTES = {
  'Grammar - Sentence Structure': {
    short: 'Practice sentence-building drills: relative clauses, inversion, and passive reporting structures using short paired exercises.',
    long: 'Build up to producing complex, well-formed sentences accurately and automatically in both writing and speech.',
  },
  'Grammar - Tenses': {
    short: 'Review the contrast between past simple, present perfect, and present perfect continuous with timeline diagrams and contextual gap-fills.',
    long: 'Achieve confident, accurate control of all tenses so the student can narrate events at any point in time without hesitation.',
  },
  'Grammar - Conditionals & Hypotheticals': {
    short: 'Drill zero/first/second/third conditionals separately before mixing them, using real-life "what if" scenarios.',
    long: 'Use conditionals naturally and flexibly to discuss hypothetical situations, advice, and regrets.',
  },
  'Grammar - Modals': {
    short: 'Practice modals of obligation, advice, and necessity (must/have to/should/ought to) with real classroom situations.',
    long: 'Use modal verbs precisely to express obligation, permission, advice, and probability in everyday conversation.',
  },
  'Grammar - Verb Patterns': {
    short: 'Work on verb + gerund/infinitive patterns and the causative "have something done" with targeted sentence transformations.',
    long: 'Internalize verb pattern rules so they no longer need conscious thought before speaking or writing.',
  },
  'Grammar - Quantifiers & Degree': {
    short: 'Reinforce too/too much/too many/enough and so/such with short controlled practice and error correction.',
    long: 'Use quantifiers and degree words accurately and naturally in spontaneous speech.',
  },
  'Grammar - Prepositions': {
    short: 'Practice common preposition collocations (for/since, prepositions after verbs and adjectives) through short fill-in exercises.',
    long: 'Use prepositions correctly and automatically as part of fluent, natural-sounding English.',
  },
  'Vocabulary - People & Feelings': {
    short: 'Expand adjectives describing personality, feelings, and character traits through matching and description activities.',
    long: 'Build a rich, precise vocabulary for describing people and emotions in both speech and writing.',
  },
  'Vocabulary - Places, Work & Society': {
    short: 'Build topic vocabulary around places, jobs, and current affairs through reading short articles and discussion.',
    long: 'Develop the vocabulary range needed to discuss real-world topics confidently, such as work, society, and current events.',
  },
  'Vocabulary - Everyday Life': {
    short: 'Reinforce everyday verbs, collocations, phrasal verbs, and situational vocabulary (health, food, transport) through role-play.',
    long: 'Communicate smoothly in everyday practical situations with a broad, flexible everyday vocabulary.',
  },
};

// Level-aware framing so the same weak category is described differently
// depending on the student's SLC level.
const LEVEL_FRAMING = {
  'Level Intro': {
    summary: 'is at the very beginning of their English journey. Priority should go entirely to core foundations before any complex structures are introduced.',
    shortIntro: 'Start with very short, high-repetition drills on the absolute basics below:',
    longIntro: 'Long-term, the goal is steady, foundational progress toward Level 1:',
  },
  'Level 1': {
    summary: 'has begun building basic English foundations but still needs consistent reinforcement in the areas below.',
    shortIntro: 'Keep practice short, concrete, and highly repetitive in these areas:',
    longIntro: 'Long-term, the goal is to solidify these basics to reach a confident Level 2:',
  },
  'Level 2': {
    summary: 'is developing steadily but still has clear gaps that limit accuracy in the areas below.',
    shortIntro: 'Focus practice on closing these specific gaps before introducing more complex material:',
    longIntro: 'Long-term, the goal is to consolidate these areas to reach a confident Level 3:',
  },
  'Level 3': {
    summary: 'has a solid working foundation in English but still has gaps that limit fluency and accuracy in the areas below.',
    shortIntro: 'Focus practice on closing these specific gaps so they don\u2019t hold back overall progress:',
    longIntro: 'Long-term, the goal is to consolidate these areas to reach a confident Level 4:',
  },
  'Level 4': {
    summary: 'performs well overall, with a handful of areas still needing refinement before reaching full fluency.',
    shortIntro: 'These are refinement points rather than fundamentals \u2014 useful for polishing accuracy and range:',
    longIntro: 'Long-term, the goal is to refine these areas to reach a confident, fluent Level 5:',
  },
  'Level 5': {
    summary: 'performs strongly overall, with only a few areas of fine-tuning remaining.',
    shortIntro: 'These are fine-tuning points rather than fundamentals \u2014 useful for polishing precision and range:',
    longIntro: 'Long-term, the goal is near-native precision and range in the areas below:',
  },
};

// Concrete, ready-to-teach classroom activities per category, used to build the Action Plan section.
const ACTION_PLANS = {
  'Grammar - Sentence Structure': {
    activity: 'Sentence Surgery',
    steps: 'Give students pairs of short, simple sentences and have them combine them using relative clauses, or give them jumbled/broken sentences to reorder correctly.',
    example: 'Combine: "The man is my neighbor." + "He works at the bank." -> "The man who works at the bank is my neighbor."',
  },
  'Grammar - Tenses': {
    activity: 'Timeline Tenses',
    steps: 'Draw a timeline on the board marking past, present, and future. Place example sentences at different points, then give a gap-fill worksheet contrasting past simple, present perfect, and present perfect continuous.',
    example: '"I ___ (live) in this city since 2020" -> "I have lived in this city since 2020."',
  },
  'Grammar - Conditionals & Hypotheticals': {
    activity: 'What-If Chain',
    steps: 'In pairs, students build a chain of conditional sentences, each starting from the result of the previous one. Rotate through zero, first, second, and third conditionals separately before mixing.',
    example: 'Student A: "If I win the lottery, I will travel the world." Student B: "If you traveled the world, you would learn many languages."',
  },
  'Grammar - Modals': {
    activity: 'Advice Corner Role-Play',
    steps: 'Give students a list of everyday problems on cards. In pairs, one reads the problem, the other responds using should, ought to, must, or have to.',
    example: '"I have a headache." -> "You should take an aspirin." / "You ought to rest for a while."',
  },
  'Grammar - Verb Patterns': {
    activity: 'Verb Pattern Card Sort',
    steps: 'Prepare cards with verbs (enjoy, want, decide, avoid, etc.) and have students sort them into gerund vs. infinitive groups, then write example sentences. Add a few causative "have something done" examples separately.',
    example: '"enjoy" + doing -> "I enjoy reading." / "want" + to do -> "I want to read." / Causative: "I had my hair cut yesterday."',
  },
  'Grammar - Quantifiers & Degree': {
    activity: 'Error Correction Worksheet',
    steps: 'Give students sentences with common quantifier mistakes (too/too much/too many, so/such) and have them find and correct the errors in pairs.',
    example: '"There is too much noisy in here." -> "It\'s too noisy in here." / "It was so a difficult test." -> "It was such a difficult test."',
  },
  'Grammar - Prepositions': {
    activity: 'Preposition Fill-In Scenarios',
    steps: 'Create short real-life scenarios (work, travel, daily routine) with blanks for prepositions of time and place. Students complete them, then compare answers in pairs.',
    example: '"I\'ve lived here ___ 2019." -> "since 2019." / "I\'m going ___ vacation next week." -> "on vacation."',
  },
  'Vocabulary - People & Feelings': {
    activity: 'Personality Flashcard Match',
    steps: 'Prepare flashcards with personality adjectives on one side and short definitions/situations on the other. Students match them, then describe a classmate or public figure using at least 3 new words.',
    example: '"reliable" -> "Someone you can always count on." Practice sentence: "My best friend is very reliable \u2014 she\'s never late."',
  },
  'Vocabulary - Places, Work & Society': {
    activity: 'News Snapshot Discussion',
    steps: 'Bring a short, simple news article or headline about work, places, or current events. Have students pick 5 target words, look them up together, then use each in a sentence about their own life or city.',
    example: 'Target word: "promoted" -> "My sister was promoted to manager last year."',
  },
  'Vocabulary - Everyday Life': {
    activity: 'Everyday Situation Role-Play',
    steps: 'Set up short role-play scenarios (ordering at a restaurant, doctor\u2019s visit, asking for directions, buying tickets) using target vocabulary cards as prompts.',
    example: 'Restaurant scenario: "Are you ready to order?" -> "Not yet, I\'m still looking at the menu."',
  },
};

function buildActionPlan(priorityAreas) {
  if (!priorityAreas.length) {
    return 'No priority intervention areas \u2014 continue with general integrated practice (reading, writing, listening, speaking) to keep progressing.';
  }
  return priorityAreas.map((e) => {
    const plan = ACTION_PLANS[e.category];
    if (!plan) return `[${e.category}] Reinforce with targeted practice and review.`;
    return `[${e.category}] ${plan.activity}: ${plan.steps}\nExample: ${plan.example}`;
  }).join('\n\n');
}

function buildReportText(topic_breakdown, level, studentName) {
  const name = studentName || 'This student';
  const framing = LEVEL_FRAMING[level] || LEVEL_FRAMING['Level 3'];

  const entries = Object.entries(topic_breakdown).map(([category, stats]) => ({
    category,
    pct: stats.total ? stats.correct / stats.total : 0,
    correct: stats.correct,
    total: stats.total,
  }));

  entries.sort((a, b) => b.pct - a.pct);
  const strong = entries.filter((e) => e.pct >= 0.7);
  const weak = entries.filter((e) => e.pct < 0.5);
  const middling = entries.filter((e) => e.pct >= 0.5 && e.pct < 0.7);

  const strengthsList = strong.length
    ? strong.map((e) => `${e.category} (${e.correct}/${e.total} correct)`).join('; ')
    : 'no single area stands out yet — performance is fairly even across the board';

  const weaknessesList = weak.length
    ? weak.map((e) => `${e.category} (${e.correct}/${e.total} correct)`).join('; ')
    : (middling.length
        ? middling.map((e) => `${e.category} (${e.correct}/${e.total} correct)`).join('; ')
        : 'no significant weaknesses — performance is solid across all areas tested');

  const strengths = `${name} (${level} level) ${framing.summary} Strongest areas: ${strengthsList}.`;
  const weaknesses = `Areas needing the most reinforcement: ${weaknessesList}.`;

  const priorityAreas = (weak.length ? weak : middling).slice(0, 3);
  const shortTerm = priorityAreas.length
    ? `${framing.shortIntro}\n` + priorityAreas.map((e) => `• [${e.category}] ${TEACHING_NOTES[e.category]?.short || `Reinforce ${e.category}.`}`).join('\n')
    : `${framing.shortIntro}\n• Continue consolidating current level with varied practice across all skills.`;

  const longTerm = priorityAreas.length
    ? `${framing.longIntro}\n` + [...new Set(priorityAreas.map((e) => TEACHING_NOTES[e.category]?.long).filter(Boolean))]
        .map((t) => `• ${t}`).join('\n')
    : `${framing.longIntro}\n• Progress from ${level} toward the next level through varied, integrated skills practice (reading, writing, listening, speaking).`;

  const actionPlan = buildActionPlan(priorityAreas);

  return {
    strengths,
    weaknesses,
    short_term_goals: shortTerm,
    long_term_goals: longTerm,
    action_plan: actionPlan,
  };
}

module.exports = { gradeAnswers, levelFromScore, buildReportText };
