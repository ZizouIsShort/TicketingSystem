import { drizzle } from 'drizzle-orm';

async function main() {
    console.log(process.env.DATABASE_URL);
    const db = drizzle('postgres-js', process.env.DATABASE_URL);
}

main();
