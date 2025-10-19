import { index, pgTable, text, varchar, vector } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { aiResources } from "./ai_resources.ts";

export const resourceEmbeddings = pgTable(
  "resource_embeddings",
  {
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(() => aiResources.id, { onDelete: "cascade" }),
  },
  (table) => [index("embeddingIndex").using("hnsw", table.embedding.op("vector_cosine_ops"))],
);

