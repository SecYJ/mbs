import { users } from "@/db/schema";
import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";

const generateUser = async () => {
    const db = drizzle(env.DATABASE_URL);

    await seed(db, { users });
};

generateUser();
