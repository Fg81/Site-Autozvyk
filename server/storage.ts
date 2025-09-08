import { 
  adminUsers, 
  articles, 
  siteStats, 
  adBlocks,
  type AdminUser, 
  type InsertAdminUser,
  type Article, 
  type InsertArticle,
  type SiteStats,
  type InsertSiteStats,
  type AdBlock,
  type InsertAdBlock
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Admin users
  getAdminByEmail(email: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  // Articles
  getAllArticles(published?: boolean): Promise<Article[]>;
  getArticleById(id: string): Promise<Article | undefined>;
  getArticleBySlug(slug: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, article: Partial<InsertArticle>): Promise<Article>;
  deleteArticle(id: string): Promise<void>;
  getLatestArticles(limit: number): Promise<Article[]>;
  
  // Site statistics
  getTodayStats(): Promise<SiteStats | undefined>;
  updateStats(stats: InsertSiteStats): Promise<SiteStats>;
  
  // Ad blocks
  getAdBlocks(active?: boolean): Promise<AdBlock[]>;
  createAdBlock(adBlock: InsertAdBlock): Promise<AdBlock>;
  updateAdBlock(id: string, adBlock: Partial<InsertAdBlock>): Promise<AdBlock>;
  deleteAdBlock(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Admin users
  async getAdminByEmail(email: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return admin || undefined;
  }

  async createAdmin(adminData: InsertAdminUser): Promise<AdminUser> {
    const [admin] = await db
      .insert(adminUsers)
      .values(adminData)
      .returning();
    return admin;
  }

  // Articles
  async getAllArticles(published?: boolean): Promise<Article[]> {
    const query = db.select().from(articles);
    if (published !== undefined) {
      return await query.where(eq(articles.published, published)).orderBy(desc(articles.createdAt));
    }
    return await query.orderBy(desc(articles.createdAt));
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.id, id));
    return article || undefined;
  }

  async getArticleBySlug(slug: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.slug, slug));
    return article || undefined;
  }

  async createArticle(articleData: InsertArticle): Promise<Article> {
    const [article] = await db
      .insert(articles)
      .values({
        ...articleData,
        updatedAt: new Date(),
      })
      .returning();
    return article;
  }

  async updateArticle(id: string, articleData: Partial<InsertArticle>): Promise<Article> {
    const [article] = await db
      .update(articles)
      .set({
        ...articleData,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id))
      .returning();
    return article;
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  async getLatestArticles(limit: number): Promise<Article[]> {
    return await db
      .select()
      .from(articles)
      .where(eq(articles.published, true))
      .orderBy(desc(articles.createdAt))
      .limit(limit);
  }

  // Site statistics
  async getTodayStats(): Promise<SiteStats | undefined> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [stats] = await db
      .select()
      .from(siteStats)
      .where(eq(siteStats.date, today));
    return stats || undefined;
  }

  async updateStats(statsData: InsertSiteStats): Promise<SiteStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingStats = await this.getTodayStats();
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(siteStats)
        .set({
          visitors: (existingStats.visitors || 0) + (statsData.visitors || 0),
          pageviews: (existingStats.pageviews || 0) + (statsData.pageviews || 0),
          calculations: (existingStats.calculations || 0) + (statsData.calculations || 0),
        })
        .where(eq(siteStats.date, today))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(siteStats)
        .values({
          ...statsData,
          date: today,
        })
        .returning();
      return newStats;
    }
  }

  // Ad blocks
  async getAdBlocks(active?: boolean): Promise<AdBlock[]> {
    const query = db.select().from(adBlocks);
    if (active !== undefined) {
      return await query.where(eq(adBlocks.active, active));
    }
    return await query;
  }

  async createAdBlock(adBlockData: InsertAdBlock): Promise<AdBlock> {
    const [adBlock] = await db
      .insert(adBlocks)
      .values(adBlockData)
      .returning();
    return adBlock;
  }

  async updateAdBlock(id: string, adBlockData: Partial<InsertAdBlock>): Promise<AdBlock> {
    const [adBlock] = await db
      .update(adBlocks)
      .set(adBlockData)
      .where(eq(adBlocks.id, id))
      .returning();
    return adBlock;
  }

  async deleteAdBlock(id: string): Promise<void> {
    await db.delete(adBlocks).where(eq(adBlocks.id, id));
  }
}

export const storage = new DatabaseStorage();
