import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// User profiles mapped to Firebase Auth UID
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Firebase Auth UID
  fullName: text('full_name'),
  email: text('email').notNull(),
  role: text('role').notNull().default('student'), // 'student' | 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// Publishers
export const publishers = pgTable('publishers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  description: text('description'),
});

// Authors
export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  biography: text('biography'),
  websiteUrl: text('website_url'),
});

// Categories & Subcategories
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  parentCategoryId: integer('parent_category_id'),
  description: text('description'),
  icon: text('icon'),
});

// Books Catalog
export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  isbn10: text('isbn10'),
  isbn13: text('isbn13'),
  publisherId: integer('publisher_id').references(() => publishers.id),
  publisherName: text('publisher_name'),
  publicationYear: integer('publication_year'),
  edition: text('edition'),
  language: text('language').default('English'),
  coverImageUrl: text('cover_image_url'),
  difficultyLevel: text('difficulty_level').default('Intermediate'), // 'Beginner' | 'Intermediate' | 'Advanced'
  resourceType: text('resource_type').notNull().default('Textbook'), // 'Textbook' | 'Programming Guide' | 'Study Notes' | 'Reference' | 'E-Book'
  format: text('format').default('Paperback'), // 'Paperback' | 'Hardcover' | 'E-book' | 'PDF' | 'Web Resource'
  price: text('price'),
  currency: text('currency').default('INR'),
  isFree: boolean('is_free').default(false),
  verificationStatus: text('verification_status').default('Verified'), // 'Verified' | 'Sample / Unverified'
  isFeatured: boolean('is_featured').default(false),
  tableOfContents: text('table_of_contents'),
  targetAudience: text('target_audience'),
  relatedSubjects: text('related_subjects'),
  officialPublisherUrl: text('official_publisher_url'),
  freeReadUrl: text('free_read_url'),
  librarySearchUrl: text('library_search_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Many-to-many relationship: Books to Authors
export const bookAuthors = pgTable('book_authors', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  authorId: integer('author_id')
    .references(() => authors.id, { onDelete: 'cascade' })
    .notNull(),
});

// Many-to-many relationship: Books to Categories
export const bookCategories = pgTable('book_categories', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  categoryId: integer('category_id')
    .references(() => categories.id, { onDelete: 'cascade' })
    .notNull(),
});

// Availability Sources (Where to find the book)
export const availabilitySources = pgTable('availability_sources', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  sourceName: text('source_name').notNull(),
  sourceType: text('source_type').notNull(), // 'Online Store' | 'Official Publisher' | 'Free / OER' | 'University Library' | 'Physical Bookstore'
  sourceUrl: text('source_url').notNull(),
  price: text('price'),
  currency: text('currency').default('INR'),
  availabilityStatus: text('availability_status').notNull().default('Available'), // 'Available' | 'Out of Stock' | 'Digital Access' | 'Library Listing' | 'Search Listing' | 'Not Verified'
  location: text('location'),
  lastCheckedAt: text('last_checked_at'),
  verificationStatus: text('verification_status').notNull().default('Verified'), // 'Verified' | 'Sample / Unverified' | 'Search Link Only'
});

// Academic Study Resources (Notes, Question Papers, Lab Manuals, Docs)
export const studyResources = pgTable('study_resources', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  subject: text('subject').notNull(),
  semester: text('semester'),
  university: text('university'),
  resourceType: text('resource_type').notNull(), // 'Free E-Book' | 'Lecture Notes' | 'Previous Year Question Paper' | 'Lab Manual' | 'Official Documentation' | 'Practice Exercises'
  sourceUrl: text('source_url').notNull(),
  accessType: text('access_type').notNull().default('Free Online'),
  verificationStatus: text('verification_status').notNull().default('Verified Free'),
  authorOrOrg: text('author_or_org'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Student Wishlists
export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  bookId: integer('book_id')
    .references(() => books.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Student Reading Lists
export const readingLists = pgTable('reading_lists', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  bookId: integer('book_id').references(() => books.id, { onDelete: 'cascade' }),
  status: text('status').default('Want to Read'), // 'Want to Read' | 'Currently Reading' | 'Completed'
  createdAt: timestamp('created_at').defaultNow(),
});

// Reports for Broken Links / Verification
export const brokenLinkReports = pgTable('broken_link_reports', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id'),
  sourceId: integer('source_id'),
  sourceName: text('source_name').notNull(),
  reportedUrl: text('reported_url').notNull(),
  issueDescription: text('issue_description').notNull(),
  status: text('status').default('pending'), // 'pending' | 'resolved'
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  wishlists: many(wishlists),
  readingLists: many(readingLists),
}));

export const publishersRelations = relations(publishers, ({ many }) => ({
  books: many(books),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookCategories: many(bookCategories),
}));

export const booksRelations = relations(books, ({ one, many }) => ({
  publisher: one(publishers, {
    fields: [books.publisherId],
    references: [publishers.id],
  }),
  bookAuthors: many(bookAuthors),
  bookCategories: many(bookCategories),
  availabilitySources: many(availabilitySources),
  wishlists: many(wishlists),
  readingLists: many(readingLists),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, {
    fields: [bookAuthors.bookId],
    references: [books.id],
  }),
  author: one(authors, {
    fields: [bookAuthors.authorId],
    references: [authors.id],
  }),
}));

export const bookCategoriesRelations = relations(bookCategories, ({ one }) => ({
  book: one(books, {
    fields: [bookCategories.bookId],
    references: [books.id],
  }),
  category: one(categories, {
    fields: [bookCategories.categoryId],
    references: [categories.id],
  }),
}));

export const availabilitySourcesRelations = relations(
  availabilitySources,
  ({ one }) => ({
    book: one(books, {
      fields: [availabilitySources.bookId],
      references: [books.id],
    }),
  })
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(profiles, {
    fields: [wishlists.userId],
    references: [profiles.id],
  }),
  book: one(books, {
    fields: [wishlists.bookId],
    references: [books.id],
  }),
}));

export const readingListsRelations = relations(readingLists, ({ one }) => ({
  user: one(profiles, {
    fields: [readingLists.userId],
    references: [profiles.id],
  }),
  book: one(books, {
    fields: [readingLists.bookId],
    references: [books.id],
  }),
}));
