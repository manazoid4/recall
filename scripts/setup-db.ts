import { getDb } from '../lib/db';

console.log('Initializing Saved-Brain database...');
getDb();
console.log('✓ Database initialized');
console.log('  Mode:', process.env.DATABASE_URL ? 'Vercel Postgres' : 'SQLite (local)');
console.log('  Tables: sources, saved_items, enrichments, embeddings, boards, board_items, graph_edges, settings');
console.log('\nRun `npm run db:seed` to add demo data.');
