import {
  AdminStats,
  AvailabilitySource,
  Book,
  BrokenLinkReport,
  Category,
  ReadingListItem,
  StudyResource,
  UserProfile,
  WishlistItem,
} from '../types.ts';

async function fetchJson<T>(
  url: string,
  options?: RequestInit,
  token?: string | null
): Promise<T> {
  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options?.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData?.error) errorMsg = errData.error;
    } catch {
      // use default
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Books
  getBooks: (params: Record<string, string> = {}, token?: string | null) => {
    const searchParams = new URLSearchParams(params);
    return fetchJson<{ books: Book[]; total: number }>(`/api/books?${searchParams.toString()}`, {}, token);
  },

  getBookById: (id: number | string, token?: string | null) => {
    return fetchJson<{
      book: Book;
      userContext: { inWishlist: boolean; readingStatus: string | null };
      relatedBooks: Book[];
    }>(`/api/books/${id}`, {}, token);
  },

  // Categories
  getCategories: () => {
    return fetchJson<Category[]>('/api/categories');
  },

  getCategoryBySlug: (slug: string) => {
    return fetchJson<{ category: Category; books: Book[] }>(`/api/categories/${slug}`);
  },

  // Study Resources
  getResources: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetchJson<StudyResource[]>(`/api/resources?${searchParams.toString()}`);
  },

  getResourceById: (id: number | string) => {
    return fetchJson<StudyResource>(`/api/resources/${id}`);
  },

  // Where to find search
  searchAvailability: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams(params);
    return fetchJson<AvailabilitySource[]>(`/api/where-to-find?${searchParams.toString()}`);
  },

  // Report broken link
  submitReport: (data: {
    bookId?: number | null;
    sourceId?: number | null;
    sourceName: string;
    reportedUrl: string;
    issueDescription: string;
  }) => {
    return fetchJson<{ message: string; report: BrokenLinkReport }>(
      '/api/reports',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Student operations
  getWishlist: (token: string) => {
    return fetchJson<WishlistItem[]>('/api/student/wishlist', {}, token);
  },

  addToWishlist: (bookId: number, token: string) => {
    return fetchJson<{ message: string }>('/api/student/wishlist', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    }, token);
  },

  removeFromWishlist: (bookId: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/student/wishlist/${bookId}`, {
      method: 'DELETE',
    }, token);
  },

  getReadingLists: (token: string) => {
    return fetchJson<ReadingListItem[]>('/api/student/reading-lists', {}, token);
  },

  saveToReadingList: (
    data: { bookId: number; status: string; title?: string; description?: string },
    token: string
  ) => {
    return fetchJson<{ message: string }>('/api/student/reading-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  removeFromReadingList: (id: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/student/reading-lists/${id}`, {
      method: 'DELETE',
    }, token);
  },

  updateProfile: (fullName: string, token: string) => {
    return fetchJson<UserProfile>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify({ fullName }),
    }, token);
  },

  // Admin operations
  getAdminStats: (token: string) => {
    return fetchJson<AdminStats>('/api/admin/stats', {}, token);
  },

  createBook: (bookData: any, token: string) => {
    return fetchJson<{ message: string; book: Book }>('/api/admin/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }, token);
  },

  updateBook: (id: number, bookData: any, token: string) => {
    return fetchJson<{ message: string; book: Book }>(`/api/admin/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    }, token);
  },

  deleteBook: (id: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/admin/books/${id}`, {
      method: 'DELETE',
    }, token);
  },

  createCategory: (catData: any, token: string) => {
    return fetchJson<{ message: string; category: Category }>('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(catData),
    }, token);
  },

  deleteCategory: (id: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    }, token);
  },

  createResource: (resData: any, token: string) => {
    return fetchJson<{ message: string; resource: StudyResource }>('/api/admin/resources', {
      method: 'POST',
      body: JSON.stringify(resData),
    }, token);
  },

  updateResource: (id: number, resData: any, token: string) => {
    return fetchJson<{ message: string; resource: StudyResource }>(`/api/admin/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(resData),
    }, token);
  },

  deleteResource: (id: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/admin/resources/${id}`, {
      method: 'DELETE',
    }, token);
  },

  addAvailabilitySource: (data: any, token: string) => {
    return fetchJson<{ message: string; source: AvailabilitySource }>('/api/admin/availability', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  updateAvailabilitySource: (id: number, data: any, token: string) => {
    return fetchJson<{ message: string; source: AvailabilitySource }>(`/api/admin/availability/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);
  },

  deleteAvailabilitySource: (id: number, token: string) => {
    return fetchJson<{ message: string }>(`/api/admin/availability/${id}`, {
      method: 'DELETE',
    }, token);
  },

  getAdminReports: (token: string) => {
    return fetchJson<BrokenLinkReport[]>('/api/admin/reports', {}, token);
  },

  updateReportStatus: (id: number, status: string, token: string) => {
    return fetchJson<{ message: string }>(`/api/admin/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, token);
  },

  importCsv: (csvData: string, token: string) => {
    return fetchJson<{ message: string; importedCount: number }>('/api/admin/books/import-csv', {
      method: 'POST',
      body: JSON.stringify({ csvData }),
    }, token);
  },
};
