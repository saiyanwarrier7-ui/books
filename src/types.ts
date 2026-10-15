export interface Author {
  id: number;
  name: string;
  biography?: string | null;
  websiteUrl?: string | null;
}

export interface Publisher {
  id: number;
  name: string;
  websiteUrl?: string | null;
  description?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentCategoryId?: number | null;
  description?: string | null;
  icon?: string | null;
  bookCount?: number;
}

export interface AvailabilitySource {
  id: number;
  bookId: number;
  sourceName: string;
  sourceType: 'Online Store' | 'Official Publisher' | 'Free / OER' | 'University Library' | 'Physical Bookstore';
  sourceUrl: string;
  price?: string | null;
  currency?: string | null;
  availabilityStatus: 'Available' | 'Out of Stock' | 'Digital Access' | 'Library Listing' | 'Search Listing' | 'Not Verified';
  location?: string | null;
  lastCheckedAt?: string | null;
  verificationStatus: 'Verified' | 'Sample / Unverified' | 'Search Link Only';
  bookTitle?: string;
  bookCover?: string;
  bookResourceType?: string;
}

export interface Book {
  id: number;
  title: string;
  description: string;
  isbn10?: string | null;
  isbn13?: string | null;
  publisherId?: number | null;
  publisherName?: string | null;
  publisher?: Publisher | null;
  publicationYear?: number | null;
  edition?: string | null;
  language?: string | null;
  coverImageUrl?: string | null;
  difficultyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  resourceType: 'Textbook' | 'Programming Guide' | 'Study Notes' | 'Reference' | 'E-Book' | string;
  format?: string | null;
  price?: string | null;
  currency?: string | null;
  isFree: boolean;
  verificationStatus?: string | null;
  isFeatured?: boolean;
  tableOfContents?: string | null;
  targetAudience?: string | null;
  relatedSubjects?: string | null;
  officialPublisherUrl?: string | null;
  freeReadUrl?: string | null;
  librarySearchUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  authors?: Author[];
  categories?: Category[];
  availabilitySources?: AvailabilitySource[];
  isSavedInWishlist?: boolean;
}

export interface StudyResource {
  id: number;
  title: string;
  description: string;
  subject: string;
  semester?: string | null;
  university?: string | null;
  resourceType: 'Free E-Book' | 'Lecture Notes' | 'Previous Year Question Paper' | 'Lab Manual' | 'Official Documentation' | 'Practice Exercises';
  sourceUrl: string;
  accessType: 'Free Online' | 'PDF Download' | 'Official Portal';
  verificationStatus: string;
  authorOrOrg?: string | null;
  createdAt?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string | null;
  role: 'student' | 'admin';
  createdAt?: string;
}

export interface WishlistItem {
  wishlistId: number;
  createdAt: string;
  book: Book;
}

export interface ReadingListItem {
  id: number;
  title: string;
  description?: string | null;
  status: 'Want to Read' | 'Currently Reading' | 'Completed';
  createdAt: string;
  book?: Book | null;
}

export interface BrokenLinkReport {
  id: number;
  bookId?: number | null;
  sourceId?: number | null;
  sourceName: string;
  reportedUrl: string;
  issueDescription: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  bookTitle?: string | null;
}

export interface AdminStats {
  totalBooks: number;
  totalCategories: number;
  totalResources: number;
  totalSources: number;
  pendingReports: number;
  totalAuthors: number;
}
