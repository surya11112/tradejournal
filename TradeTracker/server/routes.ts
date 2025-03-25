import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTradeSchema, 
  insertJournalEntrySchema, 
  insertNoteSchema, 
  insertPlaybookSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS and common middleware
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });

  // Trade routes
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getAllTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  app.get("/api/trades/:id", async (req, res) => {
    try {
      const trade = await storage.getTradeById(parseInt(req.params.id));
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      res.json(trade);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trade" });
    }
  });

  app.post("/api/trades", async (req, res) => {
    try {
      console.log('Received trade data:', JSON.stringify(req.body, null, 2));
      
      // Convert entryTime to Date object with robust error handling
      let entryTime = new Date();
      try {
        if (req.body.entryTime) {
          console.log('Attempting to parse entryTime:', req.body.entryTime, 'Type:', typeof req.body.entryTime);
          
          if (typeof req.body.entryTime === 'string') {
            entryTime = new Date(req.body.entryTime);
          } else if (req.body.entryTime instanceof Date) {
            entryTime = req.body.entryTime;
          } else {
            console.error('entryTime is neither string nor Date:', req.body.entryTime);
            entryTime = new Date(); // Fallback to current time
          }
          
          if (isNaN(entryTime.getTime())) {
            console.error('Parsed entryTime is invalid:', entryTime);
            entryTime = new Date(); // Fallback to current time
          }
        }
      } catch (error) {
        console.error('Error processing entryTime:', error);
        entryTime = new Date(); // Fallback to current time
      }
      
      console.log('Final entryTime for database:', entryTime);
      
      // Handle exitTime
      let exitTime = undefined;
      if (req.body.exitTime) {
        try {
          exitTime = new Date(req.body.exitTime);
          if (isNaN(exitTime.getTime())) {
            exitTime = undefined;
          }
        } catch (error) {
          console.error('Error parsing exitTime:', error);
          exitTime = undefined;
        }
      }
      
      // Create preprocessed data to match schema
      const preprocessedData = {
        ...req.body,
        entryPrice: String(req.body.entryPrice || ''),
        exitPrice: req.body.exitPrice ? String(req.body.exitPrice) : undefined,
        quantity: String(req.body.quantity || ''),
        stopLoss: req.body.stopLoss ? String(req.body.stopLoss) : undefined,
        takeProfit: req.body.takeProfit ? String(req.body.takeProfit) : undefined,
        fees: req.body.fees ? String(req.body.fees) : undefined,
        entryTime: entryTime, // Use our processed Date object
        exitTime: exitTime,
      };
      
      console.log('Preprocessed data type check:', 
        'entryTime type:', typeof preprocessedData.entryTime,
        'isDate:', preprocessedData.entryTime instanceof Date
      );
      
      const validatedData = insertTradeSchema.parse(preprocessedData);
      console.log('Data validated successfully');
      
      const trade = await storage.createTrade(validatedData);
      res.status(201).json(trade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error('Server error:', error);
      res.status(500).json({ error: "Failed to create trade" });
    }
  });

  app.put("/api/trades/:id", async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      console.log('Updating trade:', tradeId, JSON.stringify(req.body, null, 2));
      
      // Validate and parse dates consistently with the POST endpoint
      let entryTime = undefined;
      if (req.body.entryTime) {
        try {
          entryTime = new Date(req.body.entryTime);
          if (isNaN(entryTime.getTime())) {
            console.error('Invalid entryTime format in update:', req.body.entryTime);
            entryTime = undefined; // Keep undefined for partial updates
          }
        } catch (error) {
          console.error('Error parsing entryTime in update:', error);
        }
      }
      
      let exitTime = undefined;
      if (req.body.exitTime) {
        try {
          exitTime = new Date(req.body.exitTime);
          if (isNaN(exitTime.getTime())) {
            console.error('Invalid exitTime format in update:', req.body.exitTime);
            exitTime = undefined;
          }
        } catch (error) {
          console.error('Error parsing exitTime in update:', error);
        }
      }
      
      // Preprocess all fields to match schema requirements
      const preprocessedData = {
        ...req.body,
        // Convert numeric fields to strings
        entryPrice: req.body.entryPrice ? String(req.body.entryPrice) : undefined,
        exitPrice: req.body.exitPrice ? String(req.body.exitPrice) : undefined,
        quantity: req.body.quantity ? String(req.body.quantity) : undefined,
        stopLoss: req.body.stopLoss ? String(req.body.stopLoss) : undefined,
        takeProfit: req.body.takeProfit ? String(req.body.takeProfit) : undefined,
        fees: req.body.fees ? String(req.body.fees) : undefined,
        // Set date fields only if they were provided and valid
        entryTime: entryTime,
        exitTime: exitTime,
      };
      
      console.log('Preprocessed update data...');
      
      // Partial validation of the input
      const validatedData = insertTradeSchema.partial().parse(preprocessedData);
      console.log('Update data validated successfully');
      
      const updatedTrade = await storage.updateTrade(tradeId, validatedData);
      
      if (!updatedTrade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      
      res.json(updatedTrade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error in update:', JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error('Server error in update:', error);
      res.status(500).json({ error: "Failed to update trade" });
    }
  });

  app.delete("/api/trades/:id", async (req, res) => {
    try {
      const tradeId = parseInt(req.params.id);
      const success = await storage.deleteTrade(tradeId);
      
      if (!success) {
        return res.status(404).json({ error: "Trade not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trade" });
    }
  });

  // Journal routes
  app.get("/api/journal", async (req, res) => {
    try {
      const entries = await storage.getAllJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal/:id", async (req, res) => {
    try {
      const entry = await storage.getJournalEntryById(parseInt(req.params.id));
      if (!entry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entry" });
    }
  });

  app.get("/api/journal/date/:date", async (req, res) => {
    try {
      const date = new Date(req.params.date);
      const entries = await storage.getJournalEntriesByDate(date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries by date" });
    }
  });

  app.post("/api/journal", async (req, res) => {
    try {
      const validatedData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.put("/api/journal/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const validatedData = insertJournalEntrySchema.partial().parse(req.body);
      const updatedEntry = await storage.updateJournalEntry(entryId, validatedData);
      
      if (!updatedEntry) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.json(updatedEntry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update journal entry" });
    }
  });

  app.delete("/api/journal/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const success = await storage.deleteJournalEntry(entryId);
      
      if (!success) {
        return res.status(404).json({ error: "Journal entry not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete journal entry" });
    }
  });

  // Notes routes
  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getAllNotes();
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const note = await storage.getNoteById(parseInt(req.params.id));
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.get("/api/notes/folder/:folder", async (req, res) => {
    try {
      const folder = req.params.folder;
      const notes = await storage.getNotesByFolder(folder);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes by folder" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(validatedData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const validatedData = insertNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateNote(noteId, validatedData);
      
      if (!updatedNote) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json(updatedNote);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const success = await storage.deleteNote(noteId);
      
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Playbook routes
  app.get("/api/playbooks", async (req, res) => {
    try {
      const playbooks = await storage.getAllPlaybooks();
      res.json(playbooks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playbooks" });
    }
  });

  app.get("/api/playbooks/:id", async (req, res) => {
    try {
      const playbook = await storage.getPlaybookById(parseInt(req.params.id));
      if (!playbook) {
        return res.status(404).json({ error: "Playbook not found" });
      }
      res.json(playbook);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch playbook" });
    }
  });

  app.post("/api/playbooks", async (req, res) => {
    try {
      const validatedData = insertPlaybookSchema.parse(req.body);
      const playbook = await storage.createPlaybook(validatedData);
      res.status(201).json(playbook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create playbook" });
    }
  });

  app.put("/api/playbooks/:id", async (req, res) => {
    try {
      const playbookId = parseInt(req.params.id);
      const validatedData = insertPlaybookSchema.partial().parse(req.body);
      const updatedPlaybook = await storage.updatePlaybook(playbookId, validatedData);
      
      if (!updatedPlaybook) {
        return res.status(404).json({ error: "Playbook not found" });
      }
      
      res.json(updatedPlaybook);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update playbook" });
    }
  });

  app.delete("/api/playbooks/:id", async (req, res) => {
    try {
      const playbookId = parseInt(req.params.id);
      const success = await storage.deletePlaybook(playbookId);
      
      if (!success) {
        return res.status(404).json({ error: "Playbook not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete playbook" });
    }
  });

  // Stats routes
  app.get("/api/stats", async (req, res) => {
    try {
      const startDateStr = req.query.startDate as string;
      const endDateStr = req.query.endDate as string;
      
      let startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setHours(0, 0, 0, 0);
      
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      if (startDateStr) {
        startDate = new Date(startDateStr);
      }
      
      if (endDateStr) {
        endDate = new Date(endDateStr);
        endDate.setHours(23, 59, 59, 999);
      }
      
      const stats = await storage.getStatsByDateRange(startDate, endDate);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
