import { uuid } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export function id(name: string) {
    return uuid(name)
        .primaryKey()
        .$defaultFn(() => uuidv7());
}
