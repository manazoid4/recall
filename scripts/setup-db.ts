import { getDb } from '../lib/db';

console.log('Initializing Saved-Brain database...');
getDb();
console.log('✓ Database initialized');
console.log('  Location:', process.env.SQLITE_PATH || 'data/saved-brain.json');
console.log('  Collections: sources, saved_items, enrichments, embeddings, boards, board_items, graph_edges, settings');
console.log('\nRun `npm run db:seed` to add demo data.');
