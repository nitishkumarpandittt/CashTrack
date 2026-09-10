import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const Budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: varchar("amount").notNull(),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
});

export const Incomes = pgTable("incomes", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: varchar("amount").notNull(),
  icon: varchar("icon"),
  createdBy: varchar("createdBy").notNull(),
});
export const Expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  amount: numeric("amount").notNull().default(0),
  budgetId: integer("budgetId").references(() => Budgets.id),
  createdAt: varchar("createdAt").notNull(),
});

/** One conversation with CashTrack AI. Keyed by the owner's email like everything else. */
export const Chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

/** A single turn in a chat. `role` is "user" or "assistant". */
export const ChatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chatId")
    .references(() => Chats.id)
    .notNull(),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * A file the user attached to a message: a receipt photo, a statement PDF, a
 * CSV export. `kind` is image | pdf | text; `data` is base64 for image and
 * pdf, plain text for text. Kept so the transcript can show it again later.
 */
export const ChatAttachments = pgTable("chat_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("messageId")
    .references(() => ChatMessages.id)
    .notNull(),
  name: varchar("name").notNull(),
  mimeType: varchar("mimeType").notNull(),
  kind: varchar("kind").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(),
  // Small JPEG preview for images, so reopening a chat never downloads the
  // full file again. Null for PDFs, text files and rows that predate it.
  thumb: text("thumb"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});
