import { sql } from "drizzle-orm";
import { jsonb, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";

export const chatHistories = pgTable("chat_histories", {
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  firstMessage: varchar("first_message", { length: 255 }).notNull().default("New Chat"),
  id: varchar("id", { length: 16 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  messages: jsonb("messages").notNull(),
});
