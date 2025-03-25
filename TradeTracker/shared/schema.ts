import { pgTable, text, serial, integer, timestamp, boolean, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table (kept for compatibility)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Trades table
export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  direction: text("direction").notNull(), // "long" or "short"
  entryPrice: decimal("entry_price", { precision: 10, scale: 2 }).notNull(),
  exitPrice: decimal("exit_price", { precision: 10, scale: 2 }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  entryTime: timestamp("entry_time").notNull(),
  exitTime: timestamp("exit_time"),
  pnl: decimal("pnl", { precision: 10, scale: 2 }),
  fees: decimal("fees", { precision: 10, scale: 2 }).default("0"),
  stopLoss: decimal("stop_loss", { precision: 10, scale: 2 }),
  takeProfit: decimal("take_profit", { precision: 10, scale: 2 }),
  setup: text("setup"),
  notes: text("notes"),
  tags: text("tags").array(),
  status: text("status").default("open").notNull(), // "open" or "closed"
  account: text("account").default("default").notNull(),
  images: text("images").array(),
  tradingViewUrl: text("tradingview_url"),
});

// Journal entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: integer("mood").default(3), // 1-5 mood scale
  marketNotes: text("market_notes"),
  images: text("images").array(),
});

// Notes table
export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  folder: text("folder").default("All notes"),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Playbooks table
export const playbooks = pgTable("playbooks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rules: jsonb("rules").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Export schemas for DB operations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({ 
  id: true,
  pnl: true, 
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertPlaybookSchema = createInsertSchema(playbooks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof trades.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertPlaybook = z.infer<typeof insertPlaybookSchema>;
export type Playbook = typeof playbooks.$inferSelect;
