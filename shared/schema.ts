import { integer, pgTable, text, timestamp, boolean, decimal, json, uuid, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  username: varchar('username', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  tonBalance: decimal('ton_balance', { precision: 18, scale: 8 }).notNull().default('0'),
  starsBalance: integer('stars_balance').notNull().default(100),
  level: integer('level').notNull().default(1),
  xp: integer('xp').notNull().default(0),
  isVip: boolean('is_vip').notNull().default(false),
  isBanned: boolean('is_banned').notNull().default(false),
  joinDate: timestamp('join_date').notNull().defaultNow(),
  lastActive: timestamp('last_active').notNull().defaultNow(),
  totalSpent: decimal('total_spent', { precision: 18, scale: 8 }).notNull().default('0'),
  casesOpened: integer('cases_opened').notNull().default(0),
  photoUrl: text('photo_url'),
  languageCode: varchar('language_code', { length: 10 }),
}, (table) => ({
  usernameIdx: index('username_idx').on(table.username),
  lastActiveIdx: index('last_active_idx').on(table.lastActive),
}));

// Game cases table
export const cases = pgTable('cases', {
  id: varchar('id', { length: 100 }).primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  nameEng: varchar('name_eng', { length: 200 }),
  image: text('image'),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  ticketsPrice: integer('tickets_price').notNull().default(0),
  currency: varchar('currency', { length: 10 }).notNull().default('STARS'),
  category: varchar('category', { length: 50 }).notNull(),
  active: boolean('active').notNull().default(true),
  caseFree: boolean('case_free').notNull().default(false),
  caseForTickets: boolean('case_for_tickets').notNull().default(false),
  caseForPromo: boolean('case_for_promo').notNull().default(false),
  itemsCount: integer('items_count').notNull().default(0),
  openCount: integer('open_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index('category_idx').on(table.category),
  activeIdx: index('active_idx').on(table.active),
  priceIdx: index('price_idx').on(table.price),
}));

// Items table
export const items = pgTable('items', {
  id: varchar('id', { length: 100 }).primaryKey(),
  caseId: varchar('case_id', { length: 100 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  image: text('image'),
  type: varchar('type', { length: 50 }).notNull(),
  price: decimal('price', { precision: 18, scale: 8 }).notNull(),
  priceTon: decimal('price_ton', { precision: 18, scale: 8 }),
  rarity: varchar('rarity', { length: 50 }).notNull(),
  probability: decimal('probability', { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  caseIdIdx: index('case_id_idx').on(table.caseId),
  rarityIdx: index('rarity_idx').on(table.rarity),
  probabilityIdx: index('probability_idx').on(table.probability),
}));

// User inventory table
export const userInventory = pgTable('user_inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  itemId: varchar('item_id', { length: 100 }).notNull(),
  caseId: varchar('case_id', { length: 100 }).notNull(),
  wonAt: timestamp('won_at').notNull().defaultNow(),
  isGifted: boolean('is_gifted').notNull().default(false),
  giftedTo: integer('gifted_to'),
  giftedAt: timestamp('gifted_at'),
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  itemIdIdx: index('item_id_idx').on(table.itemId),
  wonAtIdx: index('won_at_idx').on(table.wonAt),
}));

// Transactions table
export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'deposit', 'spend', 'refund', 'bonus'
  amount: decimal('amount', { precision: 18, scale: 8 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 20 }).notNull().default('completed'),
  telegramPaymentId: varchar('telegram_payment_id', { length: 100 }),
  tonTransactionId: varchar('ton_transaction_id', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('transactions_user_id_idx').on(table.userId),
  typeIdx: index('transactions_type_idx').on(table.type),
  createdAtIdx: index('transactions_created_at_idx').on(table.createdAt),
  statusIdx: index('transactions_status_idx').on(table.status),
}));

// Case openings table
export const caseOpenings = pgTable('case_openings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: integer('user_id').notNull(),
  caseId: varchar('case_id', { length: 100 }).notNull(),
  itemId: varchar('item_id', { length: 100 }).notNull(),
  cost: decimal('cost', { precision: 18, scale: 8 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  openedAt: timestamp('opened_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('case_openings_user_id_idx').on(table.userId),
  caseIdIdx: index('case_openings_case_id_idx').on(table.caseId),
  openedAtIdx: index('case_openings_opened_at_idx').on(table.openedAt),
}));

// System settings table
export const systemSettings = pgTable('system_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  inventory: many(userInventory),
  transactions: many(transactions),
  caseOpenings: many(caseOpenings),
}));

export const casesRelations = relations(cases, ({ many }) => ({
  items: many(items),
  openings: many(caseOpenings),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  case: one(cases, {
    fields: [items.caseId],
    references: [cases.id],
  }),
  inventory: many(userInventory),
  openings: many(caseOpenings),
}));

export const userInventoryRelations = relations(userInventory, ({ one }) => ({
  user: one(users, {
    fields: [userInventory.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [userInventory.itemId],
    references: [items.id],
  }),
  case: one(cases, {
    fields: [userInventory.caseId],
    references: [cases.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const caseOpeningsRelations = relations(caseOpenings, ({ one }) => ({
  user: one(users, {
    fields: [caseOpenings.userId],
    references: [users.id],
  }),
  case: one(cases, {
    fields: [caseOpenings.caseId],
    references: [cases.id],
  }),
  item: one(items, {
    fields: [caseOpenings.itemId],
    references: [items.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;
export type Item = typeof items.$inferSelect;
export type InsertItem = typeof items.$inferInsert;
export type UserInventory = typeof userInventory.$inferSelect;
export type InsertUserInventory = typeof userInventory.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;
export type CaseOpening = typeof caseOpenings.$inferSelect;
export type InsertCaseOpening = typeof caseOpenings.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;