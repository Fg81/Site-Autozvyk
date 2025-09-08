import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { storage } from "./storage";
import { insertArticleSchema, insertAdBlockSchema } from "@shared/schema";

const adminAuthLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { message: "Too many login attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin authentication middleware
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.admin) {
    return res.status(401).json({ message: "Admin authentication required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  app.use("/api", apiLimit);

  // Initialize admin user if not exists
  app.get("/api/init", async (req, res) => {
    try {
      const existingAdmin = await storage.getAdminByEmail("zr.serega@mail.ru");
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("cthutq988ghjcn", 10);
        await storage.createAdmin({
          email: "zr.serega@mail.ru",
          passwordHash: hashedPassword,
        });
      }
      res.json({ message: "Admin user initialized" });
    } catch (error) {
      console.error("Error initializing admin:", error);
      res.status(500).json({ message: "Failed to initialize admin user" });
    }
  });

  // Admin authentication
  app.post("/api/admin/login", adminAuthLimit, async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const admin = await storage.getAdminByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).admin = { id: admin.id, email: admin.email };
      res.json({ message: "Login successful", admin: { email: admin.email } });
    } catch (error) {
      console.error("Error during admin login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/admin/me", requireAdmin, (req: any, res) => {
    res.json({ admin: req.session.admin });
  });

  // Articles API
  app.get("/api/articles", async (req, res) => {
    try {
      const published = req.query.published === "true" ? true : undefined;
      const articles = await storage.getAllArticles(published);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ message: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/latest/:limit", async (req, res) => {
    try {
      const limit = parseInt(req.params.limit) || 3;
      const articles = await storage.getLatestArticles(limit);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching latest articles:", error);
      res.status(500).json({ message: "Failed to fetch latest articles" });
    }
  });

  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticleById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(article);
    } catch (error) {
      console.error("Error fetching article:", error);
      res.status(500).json({ message: "Failed to fetch article" });
    }
  });

  app.post("/api/articles", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.parse(req.body);
      
      // Generate slug from title
      const slug = validatedData.title
        .toLowerCase()
        .replace(/[^а-яё\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 100);

      const article = await storage.createArticle({
        ...validatedData,
        slug,
      });

      res.status(201).json(article);
    } catch (error) {
      console.error("Error creating article:", error);
      res.status(500).json({ message: "Failed to create article" });
    }
  });

  app.put("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertArticleSchema.partial().parse(req.body);
      const article = await storage.updateArticle(req.params.id, validatedData);
      res.json(article);
    } catch (error) {
      console.error("Error updating article:", error);
      res.status(500).json({ message: "Failed to update article" });
    }
  });

  app.delete("/api/articles/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteArticle(req.params.id);
      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      console.error("Error deleting article:", error);
      res.status(500).json({ message: "Failed to delete article" });
    }
  });

  // Statistics API
  app.get("/api/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getTodayStats();
      res.json(stats || { visitors: 0, pageviews: 0, calculations: 0 });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/stats/track", async (req, res) => {
    try {
      const { type } = req.body;
      const updateData = { visitors: 0, pageviews: 0, calculations: 0 };
      
      if (type === "visitor") updateData.visitors = 1;
      else if (type === "pageview") updateData.pageviews = 1;
      else if (type === "calculation") updateData.calculations = 1;

      await storage.updateStats(updateData);
      res.json({ message: "Stats updated" });
    } catch (error) {
      console.error("Error updating stats:", error);
      res.status(500).json({ message: "Failed to update statistics" });
    }
  });

  // Ad blocks API
  app.get("/api/adblocks", async (req, res) => {
    try {
      const active = req.query.active === "true" ? true : undefined;
      const adBlocks = await storage.getAdBlocks(active);
      res.json(adBlocks);
    } catch (error) {
      console.error("Error fetching ad blocks:", error);
      res.status(500).json({ message: "Failed to fetch ad blocks" });
    }
  });

  app.post("/api/adblocks", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertAdBlockSchema.parse(req.body);
      const adBlock = await storage.createAdBlock(validatedData);
      res.status(201).json(adBlock);
    } catch (error) {
      console.error("Error creating ad block:", error);
      res.status(500).json({ message: "Failed to create ad block" });
    }
  });

  // Calculator tracking endpoint
  app.post("/api/calculators/track", async (req, res) => {
    try {
      await storage.updateStats({ visitors: 0, pageviews: 0, calculations: 1 });
      res.json({ message: "Calculation tracked" });
    } catch (error) {
      console.error("Error tracking calculation:", error);
      res.status(500).json({ message: "Failed to track calculation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
