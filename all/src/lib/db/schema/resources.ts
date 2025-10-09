import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { nanoid } from "nanoid";
import type { z } from "zod";

export const resources = pgTable("resources", {
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const insertResourceSchema = createSelectSchema(resources).extend({}).omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type NewResourceParams = z.infer<typeof insertResourceSchema>;
