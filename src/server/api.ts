import express, { Request, Response } from 'express';
import { db } from '../db/index.ts';
import {
  authors,
  availabilitySources,
  bookAuthors,
  bookCategories,
  books,
  brokenLinkReports,
  categories,
  profiles,
  publishers,
  readingLists,
  studyResources,
  wishlists,
} from '../db/schema.ts';
import { and, desc, eq, ilike, inArray, or, sql } from 'drizzle-orm';
import { AuthRequest, optionalAuth, requireAdmin, requireAuth } from '../middleware/auth.ts';
import { getOrCreateUser } from '../db/users.ts';

export const apiApp = express();
apiApp.use(express.json());

// Helper to fetch full book details with joined relations
async function getFullBookById(id: number) {
  const [book] = await db.select().from(books).where(eq(books.id, id));
  if (!book) return null;

  // Authors
  const authorRows = await db
    .select({
      id: authors.id,
      name: authors.name,
      biography: authors.biography,
      websiteUrl: authors.websiteUrl,
    })
    .from(bookAuthors)
    .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
    .where(eq(bookAuthors.bookId, id));

  // Categories
  const categoryRows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      icon: categories.icon,
    })
    .from(bookCategories)
    .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
    .where(eq(bookCategories.bookId, id));

  // Publisher
  let publisher = null;
  if (book.publisherId) {
    const [pub] = await db
      .select()
      .from(publishers)
      .where(eq(publishers.id, book.publisherId));
    publisher = pub || null;
  }

  // Sources
  const sources = await db
    .select()
    .from(availabilitySources)
    .where(eq(availabilitySources.bookId, id));

  return {
    ...book,
    authors: authorRows,
    categories: categoryRows,
    publisher,
    availabilitySources: sources,
  };
}

// ==========================================
// 1. PUBLIC BOOKS & CATALOG APIS
// ==========================================

// GET /api/books
apiApp.get('/books', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      q,
      category,
      difficulty,
      resourceType,
      isFree,
      format,
      sort,
      featured,
      limit = '50',
      offset = '0',
    } = req.query;

    const conditions: any[] = [];

    // Search query
    if (typeof q === 'string' && q.trim()) {
      const queryTerm = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(books.title, queryTerm),
          ilike(books.description, queryTerm),
          ilike(books.isbn10, queryTerm),
          ilike(books.isbn13, queryTerm),
          ilike(books.publisherName, queryTerm),
          ilike(books.relatedSubjects, queryTerm)
        )
      );
    }

    // Difficulty filter
    if (typeof difficulty === 'string' && difficulty && difficulty !== 'All') {
      conditions.push(eq(books.difficultyLevel, difficulty));
    }

    // Resource type filter
    if (typeof resourceType === 'string' && resourceType && resourceType !== 'All') {
      conditions.push(eq(books.resourceType, resourceType));
    }

    // Free filter
    if (isFree === 'true') {
      conditions.push(eq(books.isFree, true));
    } else if (isFree === 'false') {
      conditions.push(eq(books.isFree, false));
    }

    // Format filter
    if (typeof format === 'string' && format && format !== 'All') {
      conditions.push(ilike(books.format, `%${format}%`));
    }

    // Featured filter
    if (featured === 'true') {
      conditions.push(eq(books.isFeatured, true));
    }

    // Category filter: get book IDs matching category
    let allowedBookIds: number[] | null = null;
    if (typeof category === 'string' && category && category !== 'All') {
      const catMatches = await db
        .select({ bookId: bookCategories.bookId })
        .from(bookCategories)
        .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
        .where(or(eq(categories.slug, category), eq(categories.name, category)));
      allowedBookIds = catMatches.map((m) => m.bookId);

      if (allowedBookIds.length === 0) {
        return res.json({ books: [], total: 0 });
      }
      conditions.push(inArray(books.id, allowedBookIds));
    }

    let queryBuilder = db.select().from(books);
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }

    // Sorting
    if (sort === 'year_desc') {
      queryBuilder = queryBuilder.orderBy(desc(books.publicationYear)) as any;
    } else if (sort === 'year_asc') {
      queryBuilder = queryBuilder.orderBy(books.publicationYear) as any;
    } else if (sort === 'title') {
      queryBuilder = queryBuilder.orderBy(books.title) as any;
    } else {
      queryBuilder = queryBuilder.orderBy(desc(books.isFeatured), desc(books.id)) as any;
    }

    const parsedLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 100);
    const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

    const bookList = await queryBuilder.limit(parsedLimit).offset(parsedOffset);

    // Fetch relations for each book
    const fullBooks = await Promise.all(
      bookList.map(async (b) => {
        const authorRows = await db
          .select({
            id: authors.id,
            name: authors.name,
          })
          .from(bookAuthors)
          .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
          .where(eq(bookAuthors.bookId, b.id));

        const catRows = await db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
          })
          .from(bookCategories)
          .innerJoin(categories, eq(bookCategories.categoryId, categories.id))
          .where(eq(bookCategories.bookId, b.id));

        const sources = await db
          .select()
          .from(availabilitySources)
          .where(eq(availabilitySources.bookId, b.id));

        let isSavedInWishlist = false;
        if (req.user?.uid) {
          const [wish] = await db
            .select()
            .from(wishlists)
            .where(and(eq(wishlists.userId, req.user.uid), eq(wishlists.bookId, b.id)));
          isSavedInWishlist = !!wish;
        }

        return {
          ...b,
          authors: authorRows,
          categories: catRows,
          availabilitySources: sources,
          isSavedInWishlist,
        };
      })
    );

    res.json({ books: fullBooks, total: fullBooks.length });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Failed to retrieve books catalogue' });
  }
});

// GET /api/books/:id
apiApp.get('/books/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid book identifier' });
    }

    const book = await getFullBookById(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check wishlist and reading status if authenticated
    let userContext: any = { inWishlist: false, readingStatus: null };
    if (req.user?.uid) {
      const [wish] = await db
        .select()
        .from(wishlists)
        .where(and(eq(wishlists.userId, req.user.uid), eq(wishlists.bookId, id)));
      if (wish) userContext.inWishlist = true;

      const [reading] = await db
        .select()
        .from(readingLists)
        .where(and(eq(readingLists.userId, req.user.uid), eq(readingLists.bookId, id)));
      if (reading) userContext.readingStatus = reading.status;
    }

    // Related books (same category)
    let relatedBooks: any[] = [];
    if (book.categories.length > 0) {
      const catId = book.categories[0].id;
      const relatedMatches = await db
        .select({
          id: books.id,
          title: books.title,
          coverImageUrl: books.coverImageUrl,
          price: books.price,
          currency: books.currency,
          isFree: books.isFree,
          resourceType: books.resourceType,
        })
        .from(bookCategories)
        .innerJoin(books, eq(bookCategories.bookId, books.id))
        .where(and(eq(bookCategories.categoryId, catId), sql`${books.id} != ${id}`))
        .limit(4);
      relatedBooks = relatedMatches;
    }

    res.json({
      book,
      userContext,
      relatedBooks,
    });
  } catch (error: any) {
    console.error('Error fetching book details:', error);
    res.status(500).json({ error: 'Failed to retrieve book details' });
  }
});

// ==========================================
// 2. CATEGORIES APIS
// ==========================================

// GET /api/categories
apiApp.get('/categories', async (_req: Request, res: Response) => {
  try {
    const allCategories = await db.select().from(categories).orderBy(categories.name);

    // Get count of books for each category
    const catWithCounts = await Promise.all(
      allCategories.map(async (c) => {
        const countRes = await db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(bookCategories)
          .where(eq(bookCategories.categoryId, c.id));
        return {
          ...c,
          bookCount: countRes[0]?.count || 0,
        };
      })
    );

    res.json(catWithCounts);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

// GET /api/categories/:slug
apiApp.get('/categories/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    if (!cat) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Fetch books in this category
    const bookMatches = await db
      .select({ bookId: bookCategories.bookId })
      .from(bookCategories)
      .where(eq(bookCategories.categoryId, cat.id));

    let bookItems: any[] = [];
    if (bookMatches.length > 0) {
      const ids = bookMatches.map((m) => m.bookId);
      const rows = await db.select().from(books).where(inArray(books.id, ids));
      bookItems = await Promise.all(
        rows.map(async (b) => {
          const authorsList = await db
            .select({ id: authors.id, name: authors.name })
            .from(bookAuthors)
            .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
            .where(eq(bookAuthors.bookId, b.id));
          return { ...b, authors: authorsList };
        })
      );
    }

    res.json({ category: cat, books: bookItems });
  } catch (error: any) {
    console.error('Error fetching category by slug:', error);
    res.status(500).json({ error: 'Failed to retrieve category details' });
  }
});

// ==========================================
// 3. STUDY RESOURCES APIS (Notes, Papers, Manuals, Docs)
// ==========================================

// GET /api/resources
apiApp.get('/resources', async (req: Request, res: Response) => {
  try {
    const { subject, semester, resourceType, q } = req.query;
    const conditions: any[] = [];

    if (typeof q === 'string' && q.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(studyResources.title, term),
          ilike(studyResources.description, term),
          ilike(studyResources.subject, term),
          ilike(studyResources.authorOrOrg, term)
        )
      );
    }

    if (typeof subject === 'string' && subject && subject !== 'All') {
      conditions.push(ilike(studyResources.subject, `%${subject}%`));
    }

    if (typeof semester === 'string' && semester && semester !== 'All') {
      conditions.push(eq(studyResources.semester, semester));
    }

    if (typeof resourceType === 'string' && resourceType && resourceType !== 'All') {
      conditions.push(eq(studyResources.resourceType, resourceType));
    }

    let queryBuilder = db.select().from(studyResources);
    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }

    const resources = await queryBuilder.orderBy(desc(studyResources.id));
    res.json(resources);
  } catch (error: any) {
    console.error('Error fetching study resources:', error);
    res.status(500).json({ error: 'Failed to retrieve study resources' });
  }
});

// GET /api/resources/:id
apiApp.get('/resources/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const [resource] = await db
      .select()
      .from(studyResources)
      .where(eq(studyResources.id, id));
    if (!resource) return res.status(404).json({ error: 'Resource not found' });

    res.json(resource);
  } catch (error: any) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// ==========================================
// 4. "WHERE TO FIND" AVAILABILITY SEARCH
// ==========================================

// GET /api/where-to-find
apiApp.get('/where-to-find', async (req: Request, res: Response) => {
  try {
    const { q, sourceType, location, availabilityStatus } = req.query;

    const conditions: any[] = [];

    if (typeof sourceType === 'string' && sourceType && sourceType !== 'All') {
      conditions.push(eq(availabilitySources.sourceType, sourceType));
    }

    if (typeof availabilityStatus === 'string' && availabilityStatus && availabilityStatus !== 'All') {
      conditions.push(eq(availabilitySources.availabilityStatus, availabilityStatus));
    }

    if (typeof location === 'string' && location.trim()) {
      conditions.push(ilike(availabilitySources.location, `%${location.trim()}%`));
    }

    let queryBuilder = db
      .select({
        id: availabilitySources.id,
        bookId: availabilitySources.bookId,
        sourceName: availabilitySources.sourceName,
        sourceType: availabilitySources.sourceType,
        sourceUrl: availabilitySources.sourceUrl,
        price: availabilitySources.price,
        currency: availabilitySources.currency,
        availabilityStatus: availabilitySources.availabilityStatus,
        location: availabilitySources.location,
        lastCheckedAt: availabilitySources.lastCheckedAt,
        verificationStatus: availabilitySources.verificationStatus,
        bookTitle: books.title,
        bookCover: books.coverImageUrl,
        bookResourceType: books.resourceType,
      })
      .from(availabilitySources)
      .innerJoin(books, eq(availabilitySources.bookId, books.id));

    if (typeof q === 'string' && q.trim()) {
      const term = `%${q.trim()}%`;
      conditions.push(
        or(
          ilike(books.title, term),
          ilike(availabilitySources.sourceName, term),
          ilike(availabilitySources.location, term)
        )
      );
    }

    if (conditions.length > 0) {
      queryBuilder = queryBuilder.where(and(...conditions)) as any;
    }

    const results = await queryBuilder.limit(60);
    res.json(results);
  } catch (error: any) {
    console.error('Error searching availability sources:', error);
    res.status(500).json({ error: 'Failed to search availability listings' });
  }
});

// POST /api/reports (Report broken link or outdated source)
apiApp.post('/reports', async (req: Request, res: Response) => {
  try {
    const { bookId, sourceId, sourceName, reportedUrl, issueDescription } = req.body;
    if (!sourceName || !reportedUrl || !issueDescription) {
      return res.status(400).json({ error: 'Missing required report fields' });
    }

    const [report] = await db
      .insert(brokenLinkReports)
      .values({
        bookId: bookId ? parseInt(bookId) : null,
        sourceId: sourceId ? parseInt(sourceId) : null,
        sourceName,
        reportedUrl,
        issueDescription,
      })
      .returning();

    res.status(201).json({ message: 'Report submitted successfully. Thank you!', report });
  } catch (error: any) {
    console.error('Error creating broken link report:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// ==========================================
// 5. STUDENT ACCOUNT & PERSONAL LIBRARY
// ==========================================

// GET /api/student/profile
apiApp.get('/student/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, uid));
    if (!profile) {
      // Auto-create profile if missing
      const newProf = await getOrCreateUser(
        uid,
        req.user!.email || 'student@itstudyhub.edu',
        req.user!.name || 'Student Scholar',
        'student'
      );
      return res.json(newProf);
    }
    res.json(profile);
  } catch (error: any) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/student/profile
apiApp.put('/student/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { fullName } = req.body;
    const [updated] = await db
      .update(profiles)
      .set({ fullName })
      .where(eq(profiles.id, uid))
      .returning();
    res.json(updated);
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/student/wishlist
apiApp.get('/student/wishlist', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const items = await db
      .select({
        wishlistId: wishlists.id,
        createdAt: wishlists.createdAt,
        book: books,
      })
      .from(wishlists)
      .innerJoin(books, eq(wishlists.bookId, books.id))
      .where(eq(wishlists.userId, uid))
      .orderBy(desc(wishlists.createdAt));

    // Attach authors
    const fullItems = await Promise.all(
      items.map(async (item) => {
        const authorsList = await db
          .select({ id: authors.id, name: authors.name })
          .from(bookAuthors)
          .innerJoin(authors, eq(bookAuthors.authorId, authors.id))
          .where(eq(bookAuthors.bookId, item.book.id));
        return {
          ...item,
          book: {
            ...item.book,
            authors: authorsList,
          },
        };
      })
    );

    res.json(fullItems);
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/student/wishlist
apiApp.post('/student/wishlist', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { bookId } = req.body;
    if (!bookId) return res.status(400).json({ error: 'bookId is required' });

    // Ensure user profile exists
    await getOrCreateUser(uid, req.user!.email || 'student@itstudyhub.edu');

    // Check if already in wishlist
    const [existing] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, uid), eq(wishlists.bookId, parseInt(bookId))));

    if (existing) {
      return res.json({ message: 'Book already in wishlist', item: existing });
    }

    const [item] = await db
      .insert(wishlists)
      .values({
        userId: uid,
        bookId: parseInt(bookId),
      })
      .returning();

    res.status(201).json({ message: 'Added to wishlist', item });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// DELETE /api/student/wishlist/:bookId
apiApp.delete('/student/wishlist/:bookId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const bookId = parseInt(req.params.bookId);

    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, uid), eq(wishlists.bookId, bookId)));

    res.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// GET /api/student/reading-lists
apiApp.get('/student/reading-lists', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const items = await db
      .select({
        id: readingLists.id,
        title: readingLists.title,
        description: readingLists.description,
        status: readingLists.status,
        createdAt: readingLists.createdAt,
        book: books,
      })
      .from(readingLists)
      .leftJoin(books, eq(readingLists.bookId, books.id))
      .where(eq(readingLists.userId, uid))
      .orderBy(desc(readingLists.createdAt));

    res.json(items);
  } catch (error: any) {
    console.error('Error fetching reading lists:', error);
    res.status(500).json({ error: 'Failed to fetch reading lists' });
  }
});

// POST /api/student/reading-lists
apiApp.post('/student/reading-lists', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const { bookId, status = 'Want to Read', title, description } = req.body;

    await getOrCreateUser(uid, req.user!.email || 'student@itstudyhub.edu');

    // Check if entry already exists for this book
    if (bookId) {
      const [existing] = await db
        .select()
        .from(readingLists)
        .where(and(eq(readingLists.userId, uid), eq(readingLists.bookId, parseInt(bookId))));

      if (existing) {
        const [updated] = await db
          .update(readingLists)
          .set({ status, title: title || existing.title, description: description || existing.description })
          .where(eq(readingLists.id, existing.id))
          .returning();
        return res.json({ message: 'Reading list updated', item: updated });
      }
    }

    const [item] = await db
      .insert(readingLists)
      .values({
        userId: uid,
        bookId: bookId ? parseInt(bookId) : null,
        title: title || 'Academic Study Goal',
        description: description || '',
        status,
      })
      .returning();

    res.status(201).json({ message: 'Added to reading list', item });
  } catch (error: any) {
    console.error('Error creating reading list entry:', error);
    res.status(500).json({ error: 'Failed to save to reading list' });
  }
});

// DELETE /api/student/reading-lists/:id
apiApp.delete('/student/reading-lists/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user!.uid;
    const id = parseInt(req.params.id);
    await db
      .delete(readingLists)
      .where(and(eq(readingLists.id, id), eq(readingLists.userId, uid)));
    res.json({ message: 'Removed from reading list' });
  } catch (error: any) {
    console.error('Error deleting from reading list:', error);
    res.status(500).json({ error: 'Failed to delete reading item' });
  }
});

// ==========================================
// 6. ADMIN DASHBOARD & MANAGEMENT APIS
// ==========================================

// GET /api/admin/stats
apiApp.get('/admin/stats', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const [bookCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(books);
    const [categoryCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(categories);
    const [resourceCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(studyResources);
    const [sourceCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(availabilitySources);
    const [reportCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(brokenLinkReports);
    const [authorCount] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(authors);

    res.json({
      totalBooks: bookCount?.count || 0,
      totalCategories: categoryCount?.count || 0,
      totalResources: resourceCount?.count || 0,
      totalSources: sourceCount?.count || 0,
      pendingReports: reportCount?.count || 0,
      totalAuthors: authorCount?.count || 0,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

// POST /api/admin/books
apiApp.post('/admin/books', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      isbn10,
      isbn13,
      publisherName,
      publicationYear,
      edition,
      language = 'English',
      coverImageUrl,
      difficultyLevel = 'Intermediate',
      resourceType = 'Textbook',
      format = 'Paperback',
      price,
      currency = 'INR',
      isFree = false,
      verificationStatus = 'Verified',
      isFeatured = false,
      tableOfContents,
      targetAudience,
      relatedSubjects,
      officialPublisherUrl,
      freeReadUrl,
      librarySearchUrl,
      authorNames, // array of string names or IDs
      categoryIds, // array of category IDs
      sources, // initial array of availability sources
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const [newBook] = await db
      .insert(books)
      .values({
        title,
        description,
        isbn10,
        isbn13,
        publisherName,
        publicationYear: publicationYear ? parseInt(publicationYear) : null,
        edition,
        language,
        coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        difficultyLevel,
        resourceType,
        format,
        price,
        currency,
        isFree: !!isFree,
        verificationStatus,
        isFeatured: !!isFeatured,
        tableOfContents,
        targetAudience,
        relatedSubjects,
        officialPublisherUrl,
        freeReadUrl,
        librarySearchUrl,
      })
      .returning();

    // Handle authors
    if (Array.isArray(authorNames)) {
      for (const aName of authorNames) {
        if (!aName.trim()) continue;
        let [existingAuthor] = await db
          .select()
          .from(authors)
          .where(ilike(authors.name, aName.trim()));
        if (!existingAuthor) {
          [existingAuthor] = await db
            .insert(authors)
            .values({ name: aName.trim() })
            .returning();
        }
        await db.insert(bookAuthors).values({ bookId: newBook.id, authorId: existingAuthor.id });
      }
    }

    // Handle categories
    if (Array.isArray(categoryIds)) {
      for (const catId of categoryIds) {
        await db
          .insert(bookCategories)
          .values({ bookId: newBook.id, categoryId: parseInt(catId) });
      }
    }

    // Handle initial availability sources
    if (Array.isArray(sources)) {
      for (const src of sources) {
        if (!src.sourceName || !src.sourceUrl) continue;
        await db.insert(availabilitySources).values({
          bookId: newBook.id,
          sourceName: src.sourceName,
          sourceType: src.sourceType || 'Online Store',
          sourceUrl: src.sourceUrl,
          price: src.price || null,
          currency: src.currency || 'INR',
          availabilityStatus: src.availabilityStatus || 'Available',
          location: src.location || 'Online',
          lastCheckedAt: src.lastCheckedAt || new Date().toISOString().split('T')[0],
          verificationStatus: src.verificationStatus || 'Verified',
        });
      }
    }

    const fullBook = await getFullBookById(newBook.id);
    res.status(201).json({ message: 'Book created successfully', book: fullBook });
  } catch (error: any) {
    console.error('Error creating book:', error);
    res.status(500).json({ error: 'Failed to create book record' });
  }
});

// PUT /api/admin/books/:id
apiApp.put('/admin/books/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const {
      title,
      description,
      isbn10,
      isbn13,
      publisherName,
      publicationYear,
      edition,
      language,
      coverImageUrl,
      difficultyLevel,
      resourceType,
      format,
      price,
      currency,
      isFree,
      verificationStatus,
      isFeatured,
      tableOfContents,
      targetAudience,
      relatedSubjects,
      officialPublisherUrl,
      freeReadUrl,
      librarySearchUrl,
      authorNames,
      categoryIds,
    } = req.body;

    const [updated] = await db
      .update(books)
      .set({
        title,
        description,
        isbn10,
        isbn13,
        publisherName,
        publicationYear: publicationYear ? parseInt(publicationYear) : null,
        edition,
        language,
        coverImageUrl,
        difficultyLevel,
        resourceType,
        format,
        price,
        currency,
        isFree: !!isFree,
        verificationStatus,
        isFeatured: !!isFeatured,
        tableOfContents,
        targetAudience,
        relatedSubjects,
        officialPublisherUrl,
        freeReadUrl,
        librarySearchUrl,
        updatedAt: new Date(),
      })
      .where(eq(books.id, id))
      .returning();

    // Update authors if provided
    if (Array.isArray(authorNames)) {
      await db.delete(bookAuthors).where(eq(bookAuthors.bookId, id));
      for (const aName of authorNames) {
        if (!aName.trim()) continue;
        let [existingAuthor] = await db
          .select()
          .from(authors)
          .where(ilike(authors.name, aName.trim()));
        if (!existingAuthor) {
          [existingAuthor] = await db
            .insert(authors)
            .values({ name: aName.trim() })
            .returning();
        }
        await db.insert(bookAuthors).values({ bookId: id, authorId: existingAuthor.id });
      }
    }

    // Update categories if provided
    if (Array.isArray(categoryIds)) {
      await db.delete(bookCategories).where(eq(bookCategories.bookId, id));
      for (const catId of categoryIds) {
        await db
          .insert(bookCategories)
          .values({ bookId: id, categoryId: parseInt(catId) });
      }
    }

    const fullBook = await getFullBookById(id);
    res.json({ message: 'Book updated successfully', book: fullBook });
  } catch (error: any) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Failed to update book record' });
  }
});

// DELETE /api/admin/books/:id
apiApp.delete('/admin/books/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    await db.delete(books).where(eq(books.id, id));
    res.json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Failed to delete book record' });
  }
});

// POST /api/admin/categories
apiApp.post('/admin/categories', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, parentCategoryId, icon } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Name and slug are required' });
    }

    const [cat] = await db
      .insert(categories)
      .values({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description,
        parentCategoryId: parentCategoryId ? parseInt(parentCategoryId) : null,
        icon: icon || 'BookOpen',
      })
      .returning();

    res.status(201).json({ message: 'Category created', category: cat });
  } catch (error: any) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// DELETE /api/admin/categories/:id
apiApp.delete('/admin/categories/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(categories).where(eq(categories.id, id));
    res.json({ message: 'Category deleted' });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// POST /api/admin/resources
apiApp.post('/admin/resources', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      subject,
      semester,
      university,
      resourceType,
      sourceUrl,
      accessType = 'Free Online',
      verificationStatus = 'Verified Free',
      authorOrOrg,
    } = req.body;

    if (!title || !description || !subject || !resourceType || !sourceUrl) {
      return res.status(400).json({ error: 'Missing required resource fields' });
    }

    const [resItem] = await db
      .insert(studyResources)
      .values({
        title,
        description,
        subject,
        semester,
        university,
        resourceType,
        sourceUrl,
        accessType,
        verificationStatus,
        authorOrOrg,
      })
      .returning();

    res.status(201).json({ message: 'Resource created', resource: resItem });
  } catch (error: any) {
    console.error('Error creating study resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT /api/admin/resources/:id
apiApp.put('/admin/resources/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const {
      title,
      description,
      subject,
      semester,
      university,
      resourceType,
      sourceUrl,
      accessType,
      verificationStatus,
      authorOrOrg,
    } = req.body;

    const [resItem] = await db
      .update(studyResources)
      .set({
        title,
        description,
        subject,
        semester,
        university,
        resourceType,
        sourceUrl,
        accessType,
        verificationStatus,
        authorOrOrg,
      })
      .where(eq(studyResources.id, id))
      .returning();

    res.json({ message: 'Resource updated', resource: resItem });
  } catch (error: any) {
    console.error('Error updating study resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});

// DELETE /api/admin/resources/:id
apiApp.delete('/admin/resources/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(studyResources).where(eq(studyResources.id, id));
    res.json({ message: 'Resource deleted' });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

// POST /api/admin/availability (Add source to book)
apiApp.post('/admin/availability', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      bookId,
      sourceName,
      sourceType,
      sourceUrl,
      price,
      currency = 'INR',
      availabilityStatus = 'Available',
      location,
      lastCheckedAt,
      verificationStatus = 'Verified',
    } = req.body;

    if (!bookId || !sourceName || !sourceUrl) {
      return res.status(400).json({ error: 'Book ID, source name, and URL are required' });
    }

    const [source] = await db
      .insert(availabilitySources)
      .values({
        bookId: parseInt(bookId),
        sourceName,
        sourceType: sourceType || 'Online Store',
        sourceUrl,
        price,
        currency,
        availabilityStatus,
        location,
        lastCheckedAt: lastCheckedAt || new Date().toISOString().split('T')[0],
        verificationStatus,
      })
      .returning();

    res.status(201).json({ message: 'Availability source added', source });
  } catch (error: any) {
    console.error('Error adding availability source:', error);
    res.status(500).json({ error: 'Failed to add source' });
  }
});

// PUT /api/admin/availability/:id
apiApp.put('/admin/availability/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const {
      sourceName,
      sourceType,
      sourceUrl,
      price,
      currency,
      availabilityStatus,
      location,
      lastCheckedAt,
      verificationStatus,
    } = req.body;

    const [source] = await db
      .update(availabilitySources)
      .set({
        sourceName,
        sourceType,
        sourceUrl,
        price,
        currency,
        availabilityStatus,
        location,
        lastCheckedAt: lastCheckedAt || new Date().toISOString().split('T')[0],
        verificationStatus,
      })
      .where(eq(availabilitySources.id, id))
      .returning();

    res.json({ message: 'Availability source updated', source });
  } catch (error: any) {
    console.error('Error updating availability source:', error);
    res.status(500).json({ error: 'Failed to update source' });
  }
});

// DELETE /api/admin/availability/:id
apiApp.delete('/admin/availability/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(availabilitySources).where(eq(availabilitySources.id, id));
    res.json({ message: 'Availability source removed' });
  } catch (error: any) {
    console.error('Error deleting availability source:', error);
    res.status(500).json({ error: 'Failed to delete source' });
  }
});

// GET /api/admin/reports
apiApp.get('/admin/reports', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const reports = await db
      .select({
        id: brokenLinkReports.id,
        bookId: brokenLinkReports.bookId,
        sourceId: brokenLinkReports.sourceId,
        sourceName: brokenLinkReports.sourceName,
        reportedUrl: brokenLinkReports.reportedUrl,
        issueDescription: brokenLinkReports.issueDescription,
        status: brokenLinkReports.status,
        createdAt: brokenLinkReports.createdAt,
        bookTitle: books.title,
      })
      .from(brokenLinkReports)
      .leftJoin(books, eq(brokenLinkReports.bookId, books.id))
      .orderBy(desc(brokenLinkReports.createdAt));

    res.json(reports);
  } catch (error: any) {
    console.error('Error fetching broken link reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// PUT /api/admin/reports/:id
apiApp.put('/admin/reports/:id', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const [updated] = await db
      .update(brokenLinkReports)
      .set({ status })
      .where(eq(brokenLinkReports.id, id))
      .returning();
    res.json({ message: 'Report status updated', report: updated });
  } catch (error: any) {
    console.error('Error updating report status:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// POST /api/admin/books/import-csv
apiApp.post('/admin/books/import-csv', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { csvData } = req.body;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV string content required' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV has no data rows' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Simple CSV row parser handling quotes
      const values: string[] = [];
      let inQuotes = false;
      let curVal = '';
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(curVal.trim().replace(/^"|"$/g, ''));
          curVal = '';
        } else {
          curVal += char;
        }
      }
      values.push(curVal.trim().replace(/^"|"$/g, ''));

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      if (row.title && row.description) {
        await db.insert(books).values({
          title: row.title,
          description: row.description,
          isbn10: row.isbn10 || null,
          isbn13: row.isbn13 || null,
          publisherName: row.publisher || null,
          publicationYear: row.year ? parseInt(row.year) : null,
          difficultyLevel: row.difficulty || 'Intermediate',
          resourceType: row.resourceType || 'Textbook',
          price: row.price || null,
          isFree: row.isFree === 'true',
          verificationStatus: 'Verified',
        });
        importedCount++;
      }
    }

    res.json({ message: `Successfully imported ${importedCount} books`, importedCount });
  } catch (error: any) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ error: 'CSV parsing and import failed' });
  }
});

// GET /api/admin/books/export-csv
apiApp.get('/admin/books/export-csv', requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const allBooks = await db.select().from(books).orderBy(books.id);
    const headers = ['id', 'title', 'isbn10', 'isbn13', 'publisherName', 'publicationYear', 'difficultyLevel', 'resourceType', 'price', 'isFree', 'verificationStatus'];
    const rows = [headers.join(',')];

    for (const b of allBooks) {
      const escapeCsv = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      rows.push(
        [
          b.id,
          escapeCsv(b.title),
          escapeCsv(b.isbn10),
          escapeCsv(b.isbn13),
          escapeCsv(b.publisherName),
          b.publicationYear || '',
          escapeCsv(b.difficultyLevel),
          escapeCsv(b.resourceType),
          escapeCsv(b.price),
          b.isFree ? 'true' : 'false',
          escapeCsv(b.verificationStatus),
        ].join(',')
      );
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="it-study-hub-books.csv"');
    res.send(rows.join('\n'));
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default apiApp;
