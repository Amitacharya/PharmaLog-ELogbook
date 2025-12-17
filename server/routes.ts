import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import bcrypt from "bcrypt";
import { insertUserSchema, insertEquipmentSchema, insertLogEntrySchema, insertAuditTrailSchema, insertPMScheduleSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express session
declare module "express-session" {
  interface SessionData {
    userId: string;
    username: string;
    role: string;
  }
}

// Auth middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Audit log helper
async function logAudit(
  userId: string,
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "APPROVE" | "REJECT",
  entityType: string,
  entityId?: string,
  oldValue?: any,
  newValue?: any,
  reason?: string
) {
  await storage.createAuditLog({
    userId,
    action,
    entityType,
    entityId,
    oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
    newValue: newValue ? JSON.stringify(newValue) : undefined,
    reason,
    ipAddress: undefined,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "pharma-elog-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Seed admin user on startup
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash("admin", 10);
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      fullName: "System Administrator",
      role: "Admin",
      department: "IT",
      isActive: true,
    });
    console.log("Admin user created (username: admin, password: admin)");
  }

  // ===== AUTH ROUTES =====
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "Account is inactive" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      await logAudit(user.id, "LOGIN", "User");

      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", requireAuth, async (req, res) => {
    const userId = req.session.userId!;
    await logAudit(userId, "LOGOUT", "User");
    
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check session
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // ===== EQUIPMENT ROUTES =====

  // Get all equipment
  app.get("/api/equipment", requireAuth, async (req, res) => {
    try {
      const equipmentList = await storage.getAllEquipment();
      res.json(equipmentList);
    } catch (error) {
      console.error("Get equipment error:", error);
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  // Get equipment by ID
  app.get("/api/equipment/:id", requireAuth, async (req, res) => {
    try {
      const equipment = await storage.getEquipmentById(req.params.id);
      if (!equipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch equipment" });
    }
  });

  // Create equipment
  app.post("/api/equipment", requireAuth, async (req, res) => {
    try {
      const validatedData = insertEquipmentSchema.parse(req.body);
      const equipment = await storage.createEquipment(validatedData);
      
      await logAudit(
        req.session.userId!,
        "CREATE",
        "Equipment",
        equipment.id,
        undefined,
        equipment
      );

      res.status(201).json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create equipment error:", error);
      res.status(500).json({ error: "Failed to create equipment" });
    }
  });

  // Update equipment
  app.patch("/api/equipment/:id", requireAuth, async (req, res) => {
    try {
      const oldEquipment = await storage.getEquipmentById(req.params.id);
      if (!oldEquipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      const updates = insertEquipmentSchema.partial().parse(req.body);
      const equipment = await storage.updateEquipment(req.params.id, updates);

      await logAudit(
        req.session.userId!,
        "UPDATE",
        "Equipment",
        equipment!.id,
        oldEquipment,
        equipment
      );

      res.json(equipment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update equipment" });
    }
  });

  // Delete equipment
  app.delete("/api/equipment/:id", requireAuth, async (req, res) => {
    try {
      const oldEquipment = await storage.getEquipmentById(req.params.id);
      if (!oldEquipment) {
        return res.status(404).json({ error: "Equipment not found" });
      }

      await storage.deleteEquipment(req.params.id);

      await logAudit(
        req.session.userId!,
        "DELETE",
        "Equipment",
        req.params.id,
        oldEquipment,
        undefined
      );

      res.json({ message: "Equipment deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete equipment" });
    }
  });

  // ===== LOG ENTRY ROUTES =====

  // Get all log entries
  app.get("/api/logs", requireAuth, async (req, res) => {
    try {
      const logs = await storage.getAllLogEntries();
      res.json(logs);
    } catch (error) {
      console.error("Get logs error:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });

  // Get log entry by ID
  app.get("/api/logs/:id", requireAuth, async (req, res) => {
    try {
      const log = await storage.getLogEntryById(req.params.id);
      if (!log) {
        return res.status(404).json({ error: "Log entry not found" });
      }
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch log entry" });
    }
  });

  // Create log entry
  app.post("/api/logs", requireAuth, async (req, res) => {
    try {
      const validatedData = insertLogEntrySchema.parse({
        ...req.body,
        createdBy: req.session.userId,
      });
      
      const log = await storage.createLogEntry(validatedData);

      await logAudit(
        req.session.userId!,
        "CREATE",
        "LogEntry",
        log.id,
        undefined,
        log
      );

      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create log error:", error);
      res.status(500).json({ error: "Failed to create log entry" });
    }
  });

  // Update log entry
  app.patch("/api/logs/:id", requireAuth, async (req, res) => {
    try {
      const oldLog = await storage.getLogEntryById(req.params.id);
      if (!oldLog) {
        return res.status(404).json({ error: "Log entry not found" });
      }

      const updates = insertLogEntrySchema.partial().parse(req.body);
      const log = await storage.updateLogEntry(req.params.id, updates);

      await logAudit(
        req.session.userId!,
        "UPDATE",
        "LogEntry",
        log!.id,
        oldLog,
        log
      );

      res.json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update log entry" });
    }
  });

  // Submit log entry (with electronic signature)
  app.post("/api/logs/:id/submit", requireAuth, async (req, res) => {
    try {
      const { username, password, reason } = req.body;

      if (!username || !password || !reason) {
        return res.status(400).json({ error: "Username, password, and reason required for submission" });
      }

      // Verify electronic signature
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid signature credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid signature credentials" });
      }

      const oldLog = await storage.getLogEntryById(req.params.id);
      if (!oldLog) {
        return res.status(404).json({ error: "Log entry not found" });
      }

      const log = await storage.updateLogEntry(req.params.id, {
        status: "Submitted",
        submittedAt: new Date(),
      });

      await logAudit(
        user.id,
        "UPDATE",
        "LogEntry",
        log!.id,
        oldLog,
        log,
        `Submitted: ${reason}`
      );

      res.json(log);
    } catch (error) {
      console.error("Submit log error:", error);
      res.status(500).json({ error: "Failed to submit log entry" });
    }
  });

  // Approve log entry (with electronic signature)
  app.post("/api/logs/:id/approve", requireAuth, async (req, res) => {
    try {
      const { username, password, reason } = req.body;

      if (!username || !password || !reason) {
        return res.status(400).json({ error: "Username, password, and reason required for approval" });
      }

      // Verify electronic signature - must be QA or Admin
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid signature credentials" });
      }

      if (user.role !== "QA" && user.role !== "Admin") {
        return res.status(403).json({ error: "Only QA or Admin can approve log entries" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid signature credentials" });
      }

      const oldLog = await storage.getLogEntryById(req.params.id);
      if (!oldLog) {
        return res.status(404).json({ error: "Log entry not found" });
      }

      const log = await storage.approveLogEntry(req.params.id, user.id);

      await logAudit(
        user.id,
        "APPROVE",
        "LogEntry",
        log!.id,
        oldLog,
        log,
        `Approved: ${reason}`
      );

      res.json(log);
    } catch (error) {
      console.error("Approve log error:", error);
      res.status(500).json({ error: "Failed to approve log entry" });
    }
  });

  // ===== AUDIT TRAIL ROUTES =====

  // Get audit logs
  app.get("/api/audit", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAllAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // ===== PM SCHEDULE ROUTES =====

  // Get all PM schedules
  app.get("/api/pm-schedules", requireAuth, async (req, res) => {
    try {
      const schedules = await storage.getAllPMSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Get PM schedules error:", error);
      res.status(500).json({ error: "Failed to fetch PM schedules" });
    }
  });

  // Create PM schedule
  app.post("/api/pm-schedules", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPMScheduleSchema.parse(req.body);
      const schedule = await storage.createPMSchedule(validatedData);

      await logAudit(
        req.session.userId!,
        "CREATE",
        "PMSchedule",
        schedule.id,
        undefined,
        schedule
      );

      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create PM schedule error:", error);
      res.status(500).json({ error: "Failed to create PM schedule" });
    }
  });

  // Update PM schedule
  app.patch("/api/pm-schedules/:id", requireAuth, async (req, res) => {
    try {
      const updates = insertPMScheduleSchema.partial().parse(req.body);
      const schedule = await storage.updatePMSchedule(req.params.id, updates);

      if (!schedule) {
        return res.status(404).json({ error: "PM schedule not found" });
      }

      await logAudit(
        req.session.userId!,
        "UPDATE",
        "PMSchedule",
        schedule.id,
        undefined,
        schedule
      );

      res.json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update PM schedule" });
    }
  });

  // ===== USER MANAGEMENT ROUTES =====

  // Get all users
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords
      const sanitized = users.map(({ password, ...user }) => user);
      res.json(sanitized);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create user
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      // Only Admin can create users
      const currentUser = await storage.getUser(req.session.userId!);
      if (currentUser?.role !== "Admin") {
        return res.status(403).json({ error: "Only Admin can create users" });
      }

      const { password, ...userData } = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      await logAudit(
        req.session.userId!,
        "CREATE",
        "User",
        user.id,
        undefined,
        { ...user, password: undefined }
      );

      const { password: _, ...sanitizedUser } = user;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update user
  app.patch("/api/users/:id", requireAuth, async (req, res) => {
    try {
      // Only Admin can update users
      const currentUser = await storage.getUser(req.session.userId!);
      if (currentUser?.role !== "Admin") {
        return res.status(403).json({ error: "Only Admin can update users" });
      }

      const updates = insertUserSchema.partial().parse(req.body);
      
      // Hash password if it's being updated
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 10);
      }

      const user = await storage.updateUser(req.params.id, updates);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await logAudit(
        req.session.userId!,
        "UPDATE",
        "User",
        user.id,
        undefined,
        { ...user, password: undefined }
      );

      const { password: _, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  return httpServer;
}
