import { users, cases, items, userInventory, transactions, caseOpenings, systemSettings } from "@/shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, sum, count } from "drizzle-orm";
import type { User, InsertUser, Case, InsertCase, Item, InsertItem, UserInventory, InsertUserInventory, Transaction, InsertTransaction, CaseOpening, InsertCaseOpening } from "@/shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Case operations
  getAllCases(): Promise<Case[]>;
  getCase(id: string): Promise<Case | undefined>;
  createCase(insertCase: InsertCase): Promise<Case>;
  updateCase(id: string, updates: Partial<Case>): Promise<Case | undefined>;
  
  // Item operations
  getItemsByCase(caseId: string): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(insertItem: InsertItem): Promise<Item>;
  
  // User inventory operations
  getUserInventory(userId: number): Promise<UserInventory[]>;
  addToInventory(insertInventory: InsertUserInventory): Promise<UserInventory>;
  
  // Transaction operations
  createTransaction(insertTransaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  
  // Case opening operations
  recordCaseOpening(insertOpening: InsertCaseOpening): Promise<CaseOpening>;
  getUserCaseOpenings(userId: number): Promise<CaseOpening[]>;
  
  // Admin operations
  getSystemStats(): Promise<any>;
  getAllUsers(): Promise<User[]>;
  getAllTransactions(): Promise<Transaction[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (user) {
      // Update last active
      await db.update(users).set({ lastActive: new Date() }).where(eq(users.id, id));
    }
    
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user || undefined;
  }

  async getAllCases(): Promise<Case[]> {
    return await db.select().from(cases).where(eq(cases.active, true)).orderBy(desc(cases.openCount));
  }

  async getCase(id: string): Promise<Case | undefined> {
    const [case_] = await db.select().from(cases).where(eq(cases.id, id));
    return case_ || undefined;
  }

  async createCase(insertCase: InsertCase): Promise<Case> {
    const [case_] = await db.insert(cases).values(insertCase).returning();
    return case_;
  }

  async updateCase(id: string, updates: Partial<Case>): Promise<Case | undefined> {
    const [case_] = await db.update(cases).set(updates).where(eq(cases.id, id)).returning();
    return case_ || undefined;
  }

  async getItemsByCase(caseId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.caseId, caseId));
  }

  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    const [item] = await db.insert(items).values(insertItem).returning();
    return item;
  }

  async getUserInventory(userId: number): Promise<UserInventory[]> {
    return await db.select().from(userInventory).where(eq(userInventory.userId, userId)).orderBy(desc(userInventory.wonAt));
  }

  async addToInventory(insertInventory: InsertUserInventory): Promise<UserInventory> {
    const [inventory] = await db.insert(userInventory).values(insertInventory).returning();
    return inventory;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
  }

  async recordCaseOpening(insertOpening: InsertCaseOpening): Promise<CaseOpening> {
    const [opening] = await db.insert(caseOpenings).values(insertOpening).returning();
    
    // Update case open count
    await db.update(cases).set({ 
      openCount: sql`${cases.openCount} + 1` 
    }).where(eq(cases.id, insertOpening.caseId));
    
    // Update user cases opened count
    await db.update(users).set({ 
      casesOpened: sql`${users.casesOpened} + 1` 
    }).where(eq(users.id, insertOpening.userId));
    
    return opening;
  }

  async getUserCaseOpenings(userId: number): Promise<CaseOpening[]> {
    return await db.select().from(caseOpenings).where(eq(caseOpenings.userId, userId)).orderBy(desc(caseOpenings.openedAt));
  }

  async getSystemStats(): Promise<any> {
    const [totalUsers] = await db.select({ count: count() }).from(users);
    const [activeUsers] = await db.select({ count: count() }).from(users).where(sql`${users.lastActive} > NOW() - INTERVAL '24 hours'`);
    const [totalRevenue] = await db.select({ sum: sum(transactions.amount) }).from(transactions).where(eq(transactions.type, 'spend'));
    const [activeCases] = await db.select({ count: count() }).from(cases).where(eq(cases.active, true));
    const [todayOpens] = await db.select({ count: count() }).from(caseOpenings).where(sql`${caseOpenings.openedAt} > CURRENT_DATE`);
    
    return {
      totalUsers: totalUsers.count || 0,
      activeUsers: activeUsers.count || 0,
      totalRevenue: parseFloat(totalRevenue.sum || '0'),
      activeCases: activeCases.count || 0,
      todayOpens: todayOpens.count || 0,
      apiCalls: 0, // This would need to be tracked separately
      errorRate: 0, // This would need to be tracked separately
      avgResponseTime: 0, // This would need to be tracked separately
    };
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.joinDate));
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }
}

export const storage = new DatabaseStorage();