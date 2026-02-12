import createSchema from './schema';
import seed from './seed';

// Run schema creation then seeding
// Called once when the server starts
// @ts-ignore
async function initDatabase(): Promise<void> {
  await createSchema();
  await seed();
}

export default initDatabase;
