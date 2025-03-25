import { 
  users, trades, journalEntries, notes, playbooks,
  type User, type Trade, type JournalEntry, type Note, type Playbook,
  type InsertUser, type InsertTrade, type InsertJournalEntry, type InsertNote, type InsertPlaybook
} from "@shared/schema";
import { eq, and, like, desc, between, gte, lte } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Trade operations
  getAllTrades(): Promise<Trade[]>;
  getTradeById(id: number): Promise<Trade | undefined>;
  getTradesBySymbol(symbol: string): Promise<Trade[]>;
  getTradesByDateRange(startDate: Date, endDate: Date): Promise<Trade[]>;
  createTrade(trade: InsertTrade): Promise<Trade>;
  updateTrade(id: number, trade: Partial<InsertTrade>): Promise<Trade | undefined>;
  deleteTrade(id: number): Promise<boolean>;
  
  // Journal operations
  getAllJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntryById(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByDate(date: Date): Promise<JournalEntry[]>;
  getJournalEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Note operations
  getAllNotes(): Promise<Note[]>;
  getNoteById(id: number): Promise<Note | undefined>;
  getNotesByFolder(folder: string): Promise<Note[]>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Playbook operations
  getAllPlaybooks(): Promise<Playbook[]>;
  getPlaybookById(id: number): Promise<Playbook | undefined>;
  createPlaybook(playbook: InsertPlaybook): Promise<Playbook>;
  updatePlaybook(id: number, playbook: Partial<InsertPlaybook>): Promise<Playbook | undefined>;
  deletePlaybook(id: number): Promise<boolean>;
  
  // Stats operations
  getStatsByDateRange(startDate: Date, endDate: Date): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trades: Map<number, Trade>;
  private journalEntries: Map<number, JournalEntry>;
  private notes: Map<number, Note>;
  private playbooks: Map<number, Playbook>;
  
  private userCurrentId: number;
  private tradeCurrentId: number;
  private journalEntryCurrentId: number;
  private noteCurrentId: number;
  private playbookCurrentId: number;

  constructor() {
    this.users = new Map();
    this.trades = new Map();
    this.journalEntries = new Map();
    this.notes = new Map();
    this.playbooks = new Map();
    
    this.userCurrentId = 1;
    this.tradeCurrentId = 1;
    this.journalEntryCurrentId = 1;
    this.noteCurrentId = 1;
    this.playbookCurrentId = 1;
    
    // Add some default folders for notes
    this.createNote({
      title: "Trade Notes",
      content: "Example note for trade analysis",
      folder: "Trade Notes",
      tags: ["example", "setup"]
    });
    
    this.createNote({
      title: "Daily Journal",
      content: "Example note for daily journal",
      folder: "Daily Journal",
      tags: ["example", "journal"]
    });
    
    this.createNote({
      title: "Sessions Recap",
      content: "Example note for session recaps",
      folder: "Sessions Recap",
      tags: ["example", "recap"]
    });
    
    this.createNote({
      title: "My notes",
      content: "Example personal note",
      folder: "My notes",
      tags: ["example", "personal"]
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Trade operations
  async getAllTrades(): Promise<Trade[]> {
    return Array.from(this.trades.values()).sort((a, b) => {
      return new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime();
    });
  }
  
  async getTradeById(id: number): Promise<Trade | undefined> {
    return this.trades.get(id);
  }
  
  async getTradesBySymbol(symbol: string): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => trade.symbol === symbol)
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }
  
  async getTradesByDateRange(startDate: Date, endDate: Date): Promise<Trade[]> {
    return Array.from(this.trades.values())
      .filter(trade => {
        const tradeDate = new Date(trade.entryTime);
        return tradeDate >= startDate && tradeDate <= endDate;
      })
      .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
  }
  
  async createTrade(insertTrade: InsertTrade): Promise<Trade> {
    const id = this.tradeCurrentId++;
    
    // Calculate P&L if both entry and exit prices are available
    let pnl = null;
    if (insertTrade.exitPrice && insertTrade.entryPrice && insertTrade.quantity) {
      const entryPrice = parseFloat(insertTrade.entryPrice.toString());
      const exitPrice = parseFloat(insertTrade.exitPrice.toString());
      const qty = parseFloat(insertTrade.quantity.toString());
      
      if (insertTrade.direction === "long") {
        pnl = (exitPrice - entryPrice) * qty;
      } else {
        pnl = (entryPrice - exitPrice) * qty;
      }
      
      // Subtract fees if available
      if (insertTrade.fees) {
        pnl -= parseFloat(insertTrade.fees.toString());
      }
    }
    
    // Ensure all required fields are present and optional fields have default values
    const trade: Trade = { 
      ...insertTrade, 
      id,
      pnl: pnl ? pnl.toFixed(2) : null,
      tags: insertTrade.tags || [],
      images: insertTrade.images || [],
      exitPrice: insertTrade.exitPrice || null,
      exitTime: insertTrade.exitTime || null,
      stopLoss: insertTrade.stopLoss || null,
      takeProfit: insertTrade.takeProfit || null,
      setup: insertTrade.setup || null,
      notes: insertTrade.notes || null,
      fees: insertTrade.fees || "0",
      status: insertTrade.status || "open",
      account: insertTrade.account || "default",
      tradingViewUrl: insertTrade.tradingViewUrl || null
    };
    
    this.trades.set(id, trade);
    return trade;
  }
  
  async updateTrade(id: number, tradeUpdate: Partial<InsertTrade>): Promise<Trade | undefined> {
    const existingTrade = this.trades.get(id);
    if (!existingTrade) {
      return undefined;
    }
    
    const updatedTrade = { ...existingTrade, ...tradeUpdate };
    
    // Recalculate P&L if relevant fields were updated
    if (
      (tradeUpdate.exitPrice || tradeUpdate.entryPrice || tradeUpdate.quantity || tradeUpdate.direction) &&
      updatedTrade.exitPrice && updatedTrade.entryPrice && updatedTrade.quantity
    ) {
      const entryPrice = parseFloat(updatedTrade.entryPrice.toString());
      const exitPrice = parseFloat(updatedTrade.exitPrice.toString());
      const qty = parseFloat(updatedTrade.quantity.toString());
      
      let pnl;
      if (updatedTrade.direction === "long") {
        pnl = (exitPrice - entryPrice) * qty;
      } else {
        pnl = (entryPrice - exitPrice) * qty;
      }
      
      // Subtract fees if available
      if (updatedTrade.fees) {
        pnl -= parseFloat(updatedTrade.fees.toString());
      }
      
      updatedTrade.pnl = pnl.toFixed(2);
    }
    
    // Ensure images array is preserved
    if (!updatedTrade.images) {
      updatedTrade.images = existingTrade.images || [];
    }
    
    this.trades.set(id, updatedTrade);
    return updatedTrade;
  }
  
  async deleteTrade(id: number): Promise<boolean> {
    return this.trades.delete(id);
  }
  
  // Journal operations
  async getAllJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getJournalEntryById(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }
  
  async getJournalEntriesByDate(date: Date): Promise<JournalEntry[]> {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(targetDate);
    endDate.setHours(23, 59, 59, 999);
    
    return Array.from(this.journalEntries.values())
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= targetDate && entryDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async getJournalEntriesByDateRange(startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryCurrentId++;
    const entry: JournalEntry = { 
      ...insertEntry, 
      id,
      images: insertEntry.images || [],
      mood: insertEntry.mood || null,
      marketNotes: insertEntry.marketNotes || null
    };
    this.journalEntries.set(id, entry);
    return entry;
  }
  
  async updateJournalEntry(id: number, entryUpdate: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntries.get(id);
    if (!existingEntry) {
      return undefined;
    }
    
    const updatedEntry = { ...existingEntry, ...entryUpdate };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    return this.journalEntries.delete(id);
  }
  
  // Note operations
  async getAllNotes(): Promise<Note[]> {
    return Array.from(this.notes.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  
  async getNoteById(id: number): Promise<Note | undefined> {
    return this.notes.get(id);
  }
  
  async getNotesByFolder(folder: string): Promise<Note[]> {
    return Array.from(this.notes.values())
      .filter(note => note.folder === folder)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
  
  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = this.noteCurrentId++;
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id,
      tags: insertNote.tags || [],
      createdAt: now,
      updatedAt: now,
      folder: insertNote.folder || "All notes"
    };
    this.notes.set(id, note);
    return note;
  }
  
  async updateNote(id: number, noteUpdate: Partial<InsertNote>): Promise<Note | undefined> {
    const existingNote = this.notes.get(id);
    if (!existingNote) {
      return undefined;
    }
    
    const updatedNote = { 
      ...existingNote, 
      ...noteUpdate,
      updatedAt: new Date()
    };
    this.notes.set(id, updatedNote);
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    return this.notes.delete(id);
  }
  
  // Playbook operations
  async getAllPlaybooks(): Promise<Playbook[]> {
    return Array.from(this.playbooks.values()).sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
  
  async getPlaybookById(id: number): Promise<Playbook | undefined> {
    return this.playbooks.get(id);
  }
  
  async createPlaybook(insertPlaybook: InsertPlaybook): Promise<Playbook> {
    const id = this.playbookCurrentId++;
    const now = new Date();
    const playbook: Playbook = { 
      ...insertPlaybook, 
      id,
      createdAt: now,
      updatedAt: now,
      description: insertPlaybook.description || null
    };
    this.playbooks.set(id, playbook);
    return playbook;
  }
  
  async updatePlaybook(id: number, playbookUpdate: Partial<InsertPlaybook>): Promise<Playbook | undefined> {
    const existingPlaybook = this.playbooks.get(id);
    if (!existingPlaybook) {
      return undefined;
    }
    
    const updatedPlaybook = { 
      ...existingPlaybook, 
      ...playbookUpdate,
      updatedAt: new Date()
    };
    this.playbooks.set(id, updatedPlaybook);
    return updatedPlaybook;
  }
  
  async deletePlaybook(id: number): Promise<boolean> {
    return this.playbooks.delete(id);
  }
  
  // Stats operations
  async getStatsByDateRange(startDate: Date, endDate: Date): Promise<any> {
    const trades = await this.getTradesByDateRange(startDate, endDate);
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        avgWinLossRatio: 0
      };
    }
    
    // Calculate basic stats
    const closedTrades = trades.filter(t => t.status === "closed" && t.pnl !== null);
    
    if (closedTrades.length === 0) {
      return {
        totalTrades: trades.length,
        closedTrades: 0,
        openTrades: trades.length,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        avgWinLossRatio: 0
      };
    }
    
    const winningTrades = closedTrades.filter(t => t.pnl && parseFloat(t.pnl) > 0);
    const losingTrades = closedTrades.filter(t => t.pnl && parseFloat(t.pnl) <= 0);
    
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl ? parseFloat(t.pnl) : 0), 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl ? parseFloat(t.pnl) : 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl ? parseFloat(t.pnl) : 0), 0));
    
    // Find the largest win/loss
    const allPnLs = closedTrades.map(t => t.pnl ? parseFloat(t.pnl) : 0);
    const largestWin = Math.max(...allPnLs);
    const largestLoss = Math.min(...allPnLs);
    
    // Calculate averages
    const avgWin = winningTrades.length > 0 
      ? grossProfit / winningTrades.length 
      : 0;
    
    const avgLoss = losingTrades.length > 0 
      ? grossLoss / losingTrades.length 
      : 0;
    
    // Win/loss ratio and profit factor
    const winRate = closedTrades.length > 0 
      ? (winningTrades.length / closedTrades.length) * 100 
      : 0;
    
    const avgWinLossRatio = avgLoss > 0 
      ? avgWin / avgLoss 
      : 0;
    
    const profitFactor = grossLoss > 0 
      ? grossProfit / grossLoss 
      : grossProfit > 0 ? 999 : 0;
    
    // Group trades by day to calculate daily stats
    const tradesByDay = new Map<string, Trade[]>();
    
    closedTrades.forEach(trade => {
      const date = new Date(trade.entryTime);
      const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      
      if (!tradesByDay.has(dateKey)) {
        tradesByDay.set(dateKey, []);
      }
      
      tradesByDay.get(dateKey)?.push(trade);
    });
    
    // Calculate day win percentage
    let winningDays = 0;
    let losingDays = 0;
    
    tradesByDay.forEach(dayTrades => {
      const dayPnL = dayTrades.reduce((sum, t) => sum + (t.pnl ? parseFloat(t.pnl) : 0), 0);
      if (dayPnL > 0) {
        winningDays++;
      } else if (dayPnL < 0) {
        losingDays++;
      }
    });
    
    const totalDays = winningDays + losingDays;
    const dayWinRate = totalDays > 0 ? (winningDays / totalDays) * 100 : 0;
    
    return {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.length - closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat(winRate.toFixed(2)),
      dayWinRate: parseFloat(dayWinRate.toFixed(2)),
      totalPnL: parseFloat(totalPnL.toFixed(2)),
      avgWin: parseFloat(avgWin.toFixed(2)),
      avgLoss: parseFloat(avgLoss.toFixed(2)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      largestWin: parseFloat(largestWin.toFixed(2)),
      largestLoss: parseFloat(largestLoss.toFixed(2)),
      avgWinLossRatio: parseFloat(avgWinLossRatio.toFixed(2)),
      winningDays,
      losingDays
    };
  }
}

export const storage = new MemStorage();
