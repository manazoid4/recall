import { getDb } from '../lib/db';
import { v4 as uuid } from 'uuid';

console.log('Seeding demo data...');
const db = getDb();

const demoItems = [
  {
    id: uuid(),
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up - Rick Astley',
    platform: 'youtube',
    author: 'Rick Astley',
    saved_at: '2024-01-15T10:30:00Z',
    raw_data: 'Classic music video with over 1 billion views.',
  },
  {
    id: uuid(),
    url: 'https://twitter.com/elonmusk/status/1234567890',
    title: 'Elon Musk on Mars colonization',
    platform: 'twitter',
    author: 'elonmusk',
    saved_at: '2024-02-20T14:22:00Z',
    raw_data: 'Thread about timeline for Mars colony and Starship development.',
  },
  {
    id: uuid(),
    url: 'https://www.reddit.com/r/programming/comments/abc123',
    title: 'Why Rust is the future of systems programming',
    platform: 'reddit',
    author: 'rustfan42',
    saved_at: '2024-03-05T09:15:00Z',
    raw_data: 'Discussion on memory safety, ownership model, and performance benefits.',
  },
  {
    id: uuid(),
    url: 'https://www.instagram.com/p/CxYz123Abc/',
    title: 'Amazing sunset in Santorini',
    platform: 'instagram',
    author: 'travel_vibes',
    saved_at: '2024-03-18T19:45:00Z',
    raw_data: 'Beautiful photo of golden hour over the caldera.',
  },
  {
    id: uuid(),
    url: 'https://getpocket.com/read/12345678',
    title: 'The Complete Guide to Productivity',
    platform: 'pocket',
    author: 'Productivity Hub',
    saved_at: '2024-04-02T08:00:00Z',
    raw_data: 'Article covering time management, deep work, and habit formation.',
  },
  {
    id: uuid(),
    url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
    title: 'Me at the zoo - First YouTube video',
    platform: 'youtube',
    author: 'jawed',
    saved_at: '2024-04-10T12:30:00Z',
    raw_data: 'The very first video uploaded to YouTube in 2005.',
  },
  {
    id: uuid(),
    url: 'https://twitter.com/naval/status/9876543210',
    title: 'Naval on wealth creation',
    platform: 'twitter',
    author: 'naval',
    saved_at: '2024-04-25T16:20:00Z',
    raw_data: 'Thread about leverage, specific knowledge, and building wealth.',
  },
  {
    id: uuid(),
    url: 'https://www.reddit.com/r/machinelearning/comments/def456',
    title: 'GPT-4 technical analysis',
    platform: 'reddit',
    author: 'ai_researcher',
    saved_at: '2024-05-08T11:10:00Z',
    raw_data: 'Deep dive into architecture improvements and training methodology.',
  },
  {
    id: uuid(),
    url: 'https://www.instagram.com/p/DfGh789IjK/',
    title: 'Minimalist desk setup',
    platform: 'instagram',
    author: 'desk_setup_goals',
    saved_at: '2024-05-22T15:35:00Z',
    raw_data: 'Clean workspace with ultrawide monitor and mechanical keyboard.',
  },
  {
    id: uuid(),
    url: 'https://getpocket.com/read/87654321',
    title: 'How to Build a Second Brain',
    platform: 'pocket',
    author: 'Tiago Forte',
    saved_at: '2024-06-01T07:45:00Z',
    raw_data: 'Guide to capturing, organizing, and retrieving digital information.',
  },
];

const insertItem = db.prepare(
  `INSERT OR IGNORE INTO saved_items (id, url, title, author, saved_at, platform, raw_data)
   VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const insertEnrichment = db.prepare(
  `INSERT OR IGNORE INTO enrichments (id, item_id, summary, tags, sentiment, topics, entities, quality_score, provider, model)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);

const insertBoard = db.prepare(
  `INSERT OR IGNORE INTO boards (id, slug, name, description, is_public)
   VALUES (?, ?, ?, ?, ?)`
);

const insertBoardItem = db.prepare(
  `INSERT OR IGNORE INTO board_items (board_id, item_id, position)
   VALUES (?, ?, ?)`
);

const transaction = db.transaction(() => {
  // Insert items
  for (const item of demoItems) {
    insertItem.run(item.id, item.url, item.title, item.author, item.saved_at, item.platform, item.raw_data);
  }
  console.log(`✓ Inserted ${demoItems.length} demo items`);

  // Insert mock enrichments for first 5 items
  const enrichments = [
    {
      itemId: demoItems[0].id,
      summary: 'Iconic music video that became an internet phenomenon. Features Rick Astley performing the hit song.',
      tags: ['music', '80s', 'pop', 'rickroll', 'classic', 'viral'],
      sentiment: 'positive',
      topics: ['music', 'internet culture', 'nostalgia'],
      entities: ['Rick Astley', 'YouTube'],
      qualityScore: 75,
    },
    {
      itemId: demoItems[1].id,
      summary: 'Elon Musk discusses SpaceX plans for Mars colonization, Starship development timeline, and challenges of interplanetary travel.',
      tags: ['space', 'spacex', 'mars', 'elon-musk', 'technology', 'future'],
      sentiment: 'positive',
      topics: ['space exploration', 'technology', 'future'],
      entities: ['Elon Musk', 'SpaceX', 'Mars', 'Starship'],
      qualityScore: 85,
    },
    {
      itemId: demoItems[2].id,
      summary: 'Reddit discussion on why Rust programming language is gaining traction for systems programming due to memory safety and performance.',
      tags: ['programming', 'rust', 'systems', 'memory-safety', 'performance'],
      sentiment: 'positive',
      topics: ['programming languages', 'software development'],
      entities: ['Rust', 'C++', 'systems programming'],
      qualityScore: 80,
    },
    {
      itemId: demoItems[3].id,
      summary: 'Stunning photograph of sunset over Santorini caldera during golden hour. Showcases white-washed buildings and blue domes.',
      tags: ['photography', 'travel', 'santorini', 'sunset', 'greece', 'architecture'],
      sentiment: 'positive',
      topics: ['travel', 'photography', 'architecture'],
      entities: ['Santorini', 'Greece'],
      qualityScore: 70,
    },
    {
      itemId: demoItems[4].id,
      summary: 'Comprehensive guide covering productivity techniques including time blocking, deep work sessions, and habit stacking.',
      tags: ['productivity', 'time-management', 'habits', 'deep-work', 'self-improvement'],
      sentiment: 'positive',
      topics: ['productivity', 'personal development'],
      entities: ['Cal Newport', 'James Clear'],
      qualityScore: 88,
    },
  ];

  for (const e of enrichments) {
    insertEnrichment.run(
      uuid(),
      e.itemId,
      e.summary,
      JSON.stringify(e.tags),
      e.sentiment,
      JSON.stringify(e.topics),
      JSON.stringify(e.entities),
      e.qualityScore,
      'demo',
      'gpt-4o-mini'
    );
  }
  console.log(`✓ Inserted ${enrichments.length} enrichments`);

  // Create demo boards
  const board1Id = uuid();
  const board2Id = uuid();

  insertBoard.run(board1Id, 'tech-inspiration', 'Tech Inspiration', 'Collection of tech-related content and inspiration', 1);
  insertBoard.run(board2Id, 'travel-photography', 'Travel & Photography', 'Beautiful travel photos and photography inspiration', 1);

  console.log('✓ Created 2 demo boards');

  // Add items to boards
  insertBoardItem.run(board1Id, demoItems[1].id, 0); // Elon tweet
  insertBoardItem.run(board1Id, demoItems[2].id, 1); // Rust Reddit
  insertBoardItem.run(board1Id, demoItems[6].id, 2); // Naval tweet
  insertBoardItem.run(board1Id, demoItems[7].id, 3); // GPT-4 Reddit

  insertBoardItem.run(board2Id, demoItems[3].id, 0); // Santorini
  insertBoardItem.run(board2Id, demoItems[8].id, 1); // Desk setup

  console.log('✓ Added items to boards');
});

transaction();

console.log('\n✓ Demo data seeded successfully!');
console.log('  Run `npm run dev` to start the app.');
