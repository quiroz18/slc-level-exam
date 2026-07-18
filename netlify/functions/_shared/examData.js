// ============================================================
// SERVER-ONLY exam data: correct answers + topic tags.
// This file lives inside netlify/functions and is NEVER shipped
// to the browser, so students cannot inspect it to find answers.
// If you ever edit a question's text/options, update BOTH this
// file AND public/js/questions.js so they stay in sync.
// ============================================================

const CATEGORIES = {
  STRUCTURE: 'Grammar - Sentence Structure',
  TENSES: 'Grammar - Tenses',
  CONDITIONALS: 'Grammar - Conditionals & Hypotheticals',
  MODALS: 'Grammar - Modals',
  VERB_PATTERNS: 'Grammar - Verb Patterns',
  QUANTIFIERS: 'Grammar - Quantifiers & Degree',
  PREPOSITIONS: 'Grammar - Prepositions',
  VOCAB_PEOPLE: 'Vocabulary - People & Feelings',
  VOCAB_PLACES: 'Vocabulary - Places, Work & Society',
  VOCAB_EVERYDAY: 'Vocabulary - Everyday Life',
};

// id, question text, options, correct option letter, category.
// NOTE: text/options here must match public/js/questions.js exactly
// (that file omits "correct" so it's safe to ship to the browser).
const ANSWER_KEY = [
  { id: 1, text: "I'm 18 and my brother is 20, so he's …….. me.", options: { a: 'the oldest of', b: 'older than', c: 'as old as' }, correct: 'b', category: CATEGORIES.STRUCTURE },
  { id: 2, text: "Carl's very….. He's never late, and never forgets to do things.", options: { a: 'reliable', b: 'patient', c: 'strict' }, correct: 'a', category: CATEGORIES.VOCAB_PEOPLE },
  { id: 3, text: 'We stayed in a lovely villa …….. the sea.', options: { a: 'it overlooks', b: 'overlooked', c: 'overlooking' }, correct: 'c', category: CATEGORIES.STRUCTURE },
  { id: 4, text: 'Not until the 1980s …….. for the average person to own a computer.', options: { a: 'it was possible', b: 'was it possible', c: 'was possible' }, correct: 'b', category: CATEGORIES.STRUCTURE },
  { id: 5, text: 'Jan …….. her arm on a hot iron.', options: { a: 'broke', b: 'burned', c: 'sprained' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 6, text: "Tomorrow's a holiday, so we …….. go to work.", options: { a: 'have to', b: "mustn't", c: "don't have to" }, correct: 'c', category: CATEGORIES.MODALS },
  { id: 7, text: 'I usually …….. swimming at least once a week.', options: { a: 'go', b: 'do', c: 'play' }, correct: 'a', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 8, text: 'My friend Siena …….. to Russia last year.', options: { a: 'went', b: 'has gone', c: 'has been' }, correct: 'a', category: CATEGORIES.TENSES },
  { id: 9, text: 'This is …….. area, with a lot of factories and warehouses.', options: { a: 'an agricultural', b: 'an industrial', c: 'a residential' }, correct: 'b', category: CATEGORIES.VOCAB_PLACES },
  { id: 10, text: 'If I …….. well in my exams, I …….. to university.', options: { a: 'will do; will go', b: 'will do; go', c: 'do; will go' }, correct: 'c', category: CATEGORIES.CONDITIONALS },
  { id: 11, text: 'She was so upset that she burst …….. tears.', options: { a: 'into', b: 'out', c: 'with' }, correct: 'a', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 12, text: 'Where did you go …….. holiday last year?', options: { a: 'for', b: 'on', c: 'to' }, correct: 'b', category: CATEGORIES.PREPOSITIONS },
  { id: 13, text: 'Ocean currents …….. play an important part in regulating global climate.', options: { a: 'are know to', b: 'thought to', c: 'are believed that they' }, correct: 'a', category: CATEGORIES.STRUCTURE },
  { id: 14, text: 'My cousin …….. getting a job in Bahrain.', options: { a: 'would like', b: 'is planning', c: 'is thinking of' }, correct: 'c', category: CATEGORIES.VERB_PATTERNS },
  { id: 15, text: "I can't …….. your hair, because I haven't got any scissors.", options: { a: 'brush', b: 'cut', c: 'wash' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 16, text: 'I wish I …….. have an exam tomorrow!', options: { a: "don't", b: "didn't", c: "won't" }, correct: 'b', category: CATEGORIES.CONDITIONALS },
  { id: 17, text: 'The government plans to …….. taxes on sales of luxury items.', options: { a: 'increase', b: 'expand', c: 'go up' }, correct: 'a', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 18, text: "When I first moved to Hong Kong, life in a different country was very strange, but now I'm used …….. here.", options: { a: 'living', b: 'to live', c: 'to living' }, correct: 'c', category: CATEGORIES.VERB_PATTERNS },
  { id: 19, text: 'There …….. milk in the fridge.', options: { a: 'is some', b: 'are some', c: 'is a' }, correct: 'a', category: CATEGORIES.QUANTIFIERS },
  { id: 20, text: 'Criminals are people who are guilty of …….. the law.', options: { a: 'breaking', b: 'cheating', c: 'committing' }, correct: 'a', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 21, text: "Why on earth isn't Josh here yet? …….. for him for over an hour!", options: { a: "I'm waiting", b: "I've been waiting", c: "I've waited" }, correct: 'b', category: CATEGORIES.TENSES },
  { id: 22, text: "\u201cIt's pouring down, and it's freezing.\u201d What are the weather conditions?", options: { a: 'high winds and snow', b: 'heavy rain and cold temperatures', c: 'thick cloud but quite warm' }, correct: 'b', category: CATEGORIES.VOCAB_PLACES },
  { id: 23, text: "…….. feeling OK? You don't look very well.", options: { a: 'Do you', b: 'You are', c: 'Are you' }, correct: 'c', category: CATEGORIES.STRUCTURE },
  { id: 24, text: "Daniel's hair is getting far too long; he should …….. soon.", options: { a: 'cut it', b: 'have cut it', c: 'have it cut' }, correct: 'c', category: CATEGORIES.VERB_PATTERNS },
  { id: 25, text: "Mandy works for a computer software company. She got …….. recently, and so now she's an area manager.", options: { a: 'made redundant', b: 'promoted', c: 'a raise' }, correct: 'b', category: CATEGORIES.VOCAB_PLACES },
  { id: 26, text: "I can't hear you – it's …….. noisy in here.", options: { a: 'Too', b: 'Too much', c: 'Too many' }, correct: 'a', category: CATEGORIES.QUANTIFIERS },
  { id: 27, text: 'Jamal has just sent me …….. to arrange plans for this weekend.', options: { a: 'a blog', b: 'an email', c: 'a website' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 28, text: "I promise I'll call you as soon as I ………", options: { a: 'I arrive', b: 'I arrived', c: "I'll arrive" }, correct: 'a', category: CATEGORIES.TENSES },
  { id: 29, text: 'Photographers and designers need to be very ………', options: { a: 'creative', b: 'fit', c: 'annoying' }, correct: 'a', category: CATEGORIES.VOCAB_PEOPLE },
  { id: 30, text: 'The global financial crisis, …….. is forcing lots of small businesses to close, does not look set to end soon.', options: { a: 'it', b: 'that', c: 'which' }, correct: 'c', category: CATEGORIES.STRUCTURE },
  { id: 31, text: "There …….. a terrible accident if the pilot hadn't reacted so quickly.", options: { a: 'had been', b: 'was', c: 'would have been' }, correct: 'c', category: CATEGORIES.CONDITIONALS },
  { id: 32, text: '"Are you ready to order?" "Not yet – I\'m still looking at the ………"', options: { a: 'bill', b: 'menu', c: 'service' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 33, text: '"My job is never boring." The speaker\'s job is always ………', options: { a: 'interesting', b: 'popular', c: 'difficult' }, correct: 'a', category: CATEGORIES.VOCAB_PEOPLE },
  { id: 34, text: "I've been working here …….. about the last two years.", options: { a: 'during', b: 'for', c: 'since' }, correct: 'b', category: CATEGORIES.PREPOSITIONS },
  { id: 35, text: '"It leaves from Platform 2 at 4.15." The speaker is talking about ………', options: { a: 'an airline flight', b: 'a train', c: 'a taxi' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 36, text: 'I went to a lovely …….. last Saturday. The bride was my best friend when we were at school.', options: { a: 'anniversary', b: 'marriage', c: 'wedding' }, correct: 'c', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 37, text: '"I\'ve got a headache." "Maybe you …….. to take an aspirin."', options: { a: 'should', b: 'ought', c: "don't" }, correct: 'b', category: CATEGORIES.MODALS },
  { id: 38, text: 'The patient had an …….. to insert metal pins in his broken leg.', options: { a: 'injection', b: 'operation', c: 'X-ray' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 39, text: 'She won a seat in parliament at the last ………', options: { a: 'general election', b: 'opinion poll', c: 'referendum' }, correct: 'a', category: CATEGORIES.VOCAB_PLACES },
  { id: 40, text: "I'm surprised you didn't get upset. If someone said that to me, …….. really angry.", options: { a: "I'm", b: 'I was', c: "I'd be" }, correct: 'c', category: CATEGORIES.CONDITIONALS },
  { id: 41, text: 'This used to be …….. part of the city, but since the old buildings were renovated it\u2019s become a very fashionable area.', options: { a: 'an affluent', b: 'a run-down', c: 'a trendy' }, correct: 'b', category: CATEGORIES.VOCAB_PLACES },
  { id: 42, text: 'Cassie went to bed early because she was ………', options: { a: 'tired', b: 'stressed', c: 'relaxed' }, correct: 'a', category: CATEGORIES.VOCAB_PEOPLE },
  { id: 43, text: "In the 1960s, computers were …….. expensive that ordinary people couldn't afford them.", options: { a: 'so', b: 'such', c: 'too' }, correct: 'a', category: CATEGORIES.QUANTIFIERS },
  { id: 44, text: 'Do you want …….. the match tonight?', options: { a: 'watching', b: 'watch', c: 'to watch' }, correct: 'c', category: CATEGORIES.VERB_PATTERNS },
  { id: 45, text: 'Researchers claim the new discovery is a major …….. in the fight against malaria.', options: { a: 'breakthrough', b: 'investigation', c: 'progress' }, correct: 'a', category: CATEGORIES.VOCAB_PLACES },
  { id: 46, text: "The Maths problem was really difficult and I just couldn't …….. the answer.", options: { a: 'check in', b: 'set off', c: 'work out' }, correct: 'b', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 47, text: 'When I was a child, I never …….. about the future.', options: { a: 'have worried', b: 'used to worry', c: 'was worrying' }, correct: 'b', category: CATEGORIES.TENSES },
  { id: 48, text: 'A local politician has …….. charges of corruption made by the opposition party.', options: { a: 'accused', b: 'blamed', c: 'denied' }, correct: 'c', category: CATEGORIES.VOCAB_EVERYDAY },
  { id: 49, text: '…….. worries me about society today is how completely we have come to depend on technology.', options: { a: 'That', b: 'What', c: 'Which' }, correct: 'b', category: CATEGORIES.STRUCTURE },
  { id: 50, text: 'Cats and dogs are usually kept as ………', options: { a: 'farm animals', b: 'wild animals', c: 'pets' }, correct: 'c', category: CATEGORIES.VOCAB_EVERYDAY },
];

const TOTAL_QUESTIONS = ANSWER_KEY.length;
const TIME_LIMIT_SECONDS = 60 * 60; // 1 hour

module.exports = { ANSWER_KEY, CATEGORIES, TOTAL_QUESTIONS, TIME_LIMIT_SECONDS };
