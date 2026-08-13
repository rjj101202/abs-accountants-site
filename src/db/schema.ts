import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

// Een pagina op de site. slug "" = homepage. Navigatie volgt sort + inNav.
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  navLabel: text("nav_label"),
  sort: integer("sort").notNull().default(0),
  inNav: boolean("in_nav").notNull().default(true),
  visible: boolean("visible").notNull().default(true),
});

// Een blok op een pagina. data-structuur hangt af van type (zie src/lib/blocks.ts).
export const blocks = pgTable("blocks", {
  id: serial("id").primaryKey(),
  pageId: integer("page_id")
    .notNull()
    .references(() => pages.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  data: jsonb("data").notNull().default({}),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  photoUrl: text("photo_url").notNull().default(""),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverUrl: text("cover_url").notNull().default(""),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
  visible: boolean("visible").notNull().default(true),
});

// Losse instellingen als key/value (siteName, logo, contactgegevens, footer).
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
});

// Inzendingen van het contactformulier.
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default(""),
  contact: text("contact").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});
