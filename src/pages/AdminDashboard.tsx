import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  BookOpen,
  FolderTree,
  FileText,
  Store,
  Flag,
  Plus,
  Trash2,
  Edit,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Search,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  AdminStats,
  Book,
  Category,
  StudyResource,
  BrokenLinkReport,
  AvailabilitySource,
} from '../types.ts';
import { api } from '../lib/api.ts';

export const AdminDashboard: React.FC = () => {
  const { user, profile, isAdmin, token, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'stats' | 'books' | 'categories' | 'resources' | 'availability' | 'reports' | 'csv'
  >('stats');

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Books Management
  const [books, setBooks] = useState<Book[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);

  // Categories Management
  const [categories, setCategories] = useState<Category[]>([]);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Resources Management
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [resModalOpen, setResModalOpen] = useState(false);

  // Reports
  const [reports, setReports] = useState<BrokenLinkReport[]>([]);

  // CSV
  const [csvContent, setCsvContent] = useState('');
  const [csvMessage, setCsvMessage] = useState('');

  // Availability Management
  const [selectedBookForSource, setSelectedBookForSource] = useState<number | null>(null);
  const [newSource, setNewSource] = useState({
    sourceName: '',
    sourceType: 'Online Store',
    sourceUrl: '',
    price: '',
    availabilityStatus: 'Available',
    location: '',
    verificationStatus: 'Verified',
  });

  // Action status feedback
  const [statusMsg, setStatusMsg] = useState('');
  const [statusError, setStatusError] = useState('');

  useEffect(() => {
    if (token && isAdmin) {
      loadStats();
      loadBooks();
      loadCategories();
      loadResources();
      loadReports();
    }
  }, [token, isAdmin]);

  const loadStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const data = await api.getAdminStats(token);
      setStats(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadBooks = async () => {
    try {
      const res = await api.getBooks({ limit: '100' });
      setBooks(res.books);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err) {
      console.error(err);
    }
  };

  const loadResources = async () => {
    try {
      const res = await api.getResources();
      setResources(res);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async () => {
    if (!token) return;
    try {
      const data = await api.getAdminReports(token);
      setReports(data);
    } catch (err) {
      console.error(err);
    }
  };

  const showSuccess = (msg: string) => {
    setStatusMsg(msg);
    setStatusError('');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const showError = (msg: string) => {
    setStatusError(msg);
    setStatusMsg('');
    setTimeout(() => setStatusError(''), 4000);
  };

  // Delete Book
  const handleDeleteBook = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this book record? This will also remove associated availability sources.')) {
      return;
    }
    if (!token) return;
    try {
      await api.deleteBook(id, token);
      showSuccess('Book deleted successfully');
      loadBooks();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to delete book');
    }
  };

  // Add Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !catName.trim() || !catSlug.trim()) return;
    try {
      await api.createCategory(
        { name: catName.trim(), slug: catSlug.trim(), description: catDesc.trim() },
        token
      );
      showSuccess(`Category "${catName}" created`);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      loadCategories();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to create category');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('Delete this category?')) return;
    if (!token) return;
    try {
      await api.deleteCategory(id, token);
      showSuccess('Category removed');
      loadCategories();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to delete category');
    }
  };

  // Delete Study Resource
  const handleDeleteResource = async (id: number) => {
    if (!window.confirm('Delete this study resource?')) return;
    if (!token) return;
    try {
      await api.deleteResource(id, token);
      showSuccess('Study resource removed');
      loadResources();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to delete resource');
    }
  };

  // Resolve Report
  const handleResolveReport = async (id: number, currentStatus: string) => {
    if (!token) return;
    try {
      const newStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
      await api.updateReportStatus(id, newStatus, token);
      showSuccess(`Report marked as ${newStatus}`);
      loadReports();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to update report');
    }
  };

  // Add Availability Source to selected book
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedBookForSource || !newSource.sourceName || !newSource.sourceUrl) {
      showError('Please select a book and enter source name & URL');
      return;
    }
    try {
      await api.addAvailabilitySource(
        {
          bookId: selectedBookForSource,
          ...newSource,
          lastCheckedAt: new Date().toISOString().split('T')[0],
        },
        token
      );
      showSuccess('Availability source added');
      setNewSource({
        sourceName: '',
        sourceType: 'Online Store',
        sourceUrl: '',
        price: '',
        availabilityStatus: 'Available',
        location: '',
        verificationStatus: 'Verified',
      });
      loadBooks();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to add source');
    }
  };

  // Handle CSV Import
  const handleImportCsv = async () => {
    if (!token || !csvContent.trim()) {
      showError('Please paste valid CSV content');
      return;
    }
    try {
      const res = await api.importCsv(csvContent, token);
      showSuccess(res.message);
      setCsvContent('');
      loadBooks();
      loadStats();
    } catch (err: any) {
      showError(err.message || 'Failed to import CSV');
    }
  };

  // Export CSV download trigger
  const handleExportCsv = () => {
    window.open('/api/admin/books/export-csv', '_blank');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <Shield className="w-12 h-12 text-purple-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
          <p className="text-xs text-slate-500">
            You must be logged in with an authorized Academic Administrator profile to view and edit catalog records.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                loginAsDemoAdmin();
                loadStats();
              }}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 shadow-sm transition-all"
            >
              Sign In as Demo Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn10?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.isbn13?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center text-purple-300 shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-400/30">
                  Academic Administrator
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Cloud SQL Connected
                </span>
              </div>
              <h1 className="text-2xl font-extrabold mt-1">IT Study Hub Admin Console</h1>
              <p className="text-xs text-slate-300">Logged in as {user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedBookForEdit(null);
                setBookModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Export Books as CSV"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{statusMsg}</span>
          </div>
        )}
        {statusError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{statusError}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'stats', label: 'Overview & Stats', icon: Layers },
            { id: 'books', label: `Books (${books.length})`, icon: BookOpen },
            { id: 'categories', label: `Categories (${categories.length})`, icon: FolderTree },
            { id: 'resources', label: `Study Resources (${resources.length})`, icon: FileText },
            { id: 'availability', label: 'Availability Sources', icon: Store },
            { id: 'reports', label: `Broken Links (${reports.length})`, icon: Flag },
            { id: 'csv', label: 'CSV Import / Export', icon: Upload },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. OVERVIEW & STATS TAB */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Total Books</span>
                <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats?.totalBooks || books.length}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Categories</span>
                <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats?.totalCategories || categories.length}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Study Resources</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats?.totalResources || resources.length}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Availability Listings</span>
                <div className="text-2xl font-extrabold text-purple-600 mt-1">{stats?.totalSources || 0}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Pending Reports</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{reports.filter((r) => r.status === 'pending').length}</div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[11px] text-slate-500 font-semibold uppercase">Indexed Authors</span>
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats?.totalAuthors || 17}</div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Catalog Health & Verification Actions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All changes made here persist immediately in the Cloud SQL PostgreSQL database and will reflect in the public student search catalog.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    loadStats();
                    loadBooks();
                    loadCategories();
                    showSuccess('Database records refreshed');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh DB Cache</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. BOOKS MANAGEMENT TAB */}
        {activeTab === 'books' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Filter books by title or ISBN..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>

              <button
                onClick={() => {
                  setSelectedBookForEdit(null);
                  setBookModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Book Record</span>
              </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="p-4">Title & Edition</th>
                      <th className="p-4">Publisher</th>
                      <th className="p-4">Type / Level</th>
                      <th className="p-4">Price / Free</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {filteredBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-4 max-w-xs">
                          <Link to={`/books/${b.id}`} className="font-bold text-slate-900 dark:text-white hover:text-blue-600 line-clamp-1">
                            {b.title}
                          </Link>
                          <span className="text-[11px] text-slate-400 block">
                            {b.publicationYear} • {b.edition || 'Std Edition'} • ISBN: {b.isbn10 || b.isbn13 || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">{b.publisherName || 'N/A'}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                            {b.resourceType}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">{b.difficultyLevel}</span>
                        </td>
                        <td className="p-4">
                          {b.isFree ? (
                            <span className="text-emerald-600 font-bold">Free Legal</span>
                          ) : (
                            <span className="font-semibold">{b.price ? `₹${b.price}` : 'Check store'}</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                            {b.verificationStatus || 'Verified'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBookForEdit(b);
                              setBookModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                            title="Edit Book"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(b.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CATEGORIES MANAGEMENT TAB */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kotlin & Mobile"
                    value={catName}
                    onChange={(e) => {
                      setCatName(e.target.value);
                      setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                    }}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Category
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Existing Categories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">slug: {c.slug}</p>
                      <span className="text-[10px] text-blue-600">{c.bookCount || 0} books</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. RESOURCES MANAGEMENT TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Academic Study Resources</h3>
                <p className="text-xs text-slate-500">Lecture notes, semester question papers, and lab practical manuals.</p>
              </div>
              <button
                onClick={() => setResModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Study Resource</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((res) => (
                <div
                  key={res.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {res.resourceType}
                      </span>
                      <span className="text-xs text-slate-400">{res.semester}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{res.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{res.description}</p>
                    <div className="text-[11px] text-slate-400">
                      <strong>Subject:</strong> {res.subject} • <strong>Curriculum:</strong> {res.university || 'General'}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={res.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => handleDeleteResource(res.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. AVAILABILITY SOURCES TAB */}
        {activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Availability Channel
              </h3>
              <form onSubmit={handleAddSource} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Book
                  </label>
                  <select
                    value={selectedBookForSource || ''}
                    onChange={(e) => setSelectedBookForSource(parseInt(e.target.value) || null)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="">-- Choose Book --</option>
                    {books.map((b) => (
                      <option key={b.id} value={b.id}>{b.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon India, Wiley Store, Central Library"
                    value={newSource.sourceName}
                    onChange={(e) => setNewSource({ ...newSource, sourceName: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Source Type
                  </label>
                  <select
                    value={newSource.sourceType}
                    onChange={(e) => setNewSource({ ...newSource, sourceType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  >
                    <option value="Online Store">Online Store</option>
                    <option value="Official Publisher">Official Publisher</option>
                    <option value="Free / OER">Free / OER</option>
                    <option value="University Library">University Library</option>
                    <option value="Physical Bookstore">Physical Bookstore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verified Source URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newSource.sourceUrl}
                    onChange={(e) => setNewSource({ ...newSource, sourceUrl: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹850 or Free"
                      value={newSource.price}
                      onChange={(e) => setNewSource({ ...newSource, price: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                    <select
                      value={newSource.availabilityStatus}
                      onChange={(e) => setNewSource({ ...newSource, availabilityStatus: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                    >
                      <option value="Available">Available</option>
                      <option value="Digital Access">Digital Access</option>
                      <option value="Library Listing">Library Listing</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Library Wing / Shelf
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Central Library Shelf 4B or Delhi Warehouse"
                    value={newSource.location}
                    onChange={(e) => setNewSource({ ...newSource, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Record Availability Source
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Recently Verified Sources
              </h3>
              <p className="text-xs text-slate-500">
                Sources appear dynamically under each book's "Where to Find" section.
              </p>
              <div className="space-y-3">
                {books.slice(0, 5).map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{b.title}</h4>
                    <div className="space-y-1.5">
                      {b.availabilitySources?.map((src) => (
                        <div key={src.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{src.sourceName}</span>
                            <span className="text-slate-400 ml-2">({src.sourceType})</span>
                            {src.price && <span className="text-blue-600 ml-2 font-medium">{src.price}</span>}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {src.availabilityStatus}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. BROKEN LINK REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Community Link & Source Reports</h3>
              <p className="text-xs text-slate-500">Students and users can report expired links, 404s, or pricing discrepancies.</p>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white">No Pending Reports</h4>
                <p className="text-xs text-slate-500 mt-1">All catalog links and availability records are verified.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          rep.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {rep.status}
                        </span>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {rep.sourceName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        <strong>Issue:</strong> {rep.issueDescription}
                      </p>
                      <p className="text-xs text-blue-600 truncate max-w-lg font-mono">
                        {rep.reportedUrl}
                      </p>
                    </div>

                    <button
                      onClick={() => handleResolveReport(rep.id, rep.status)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        rep.status === 'resolved'
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {rep.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. CSV IMPORT / EXPORT TAB */}
        {activeTab === 'csv' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                Bulk Import Books via CSV
              </h3>
              <p className="text-xs text-slate-500">
                Paste CSV formatted text with columns: <code>title,description,isbn10,isbn13,publisher,year,difficulty,resourceType,price,isFree</code>
              </p>
              <textarea
                rows={10}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={`title,description,isbn10,isbn13,publisher,year,difficulty,resourceType,price,isFree\n"Clean Architecture","Guide to craft software structure","0134494164","978-0134494166","Pearson",2017,"Intermediate","Textbook","799",false`}
                className="w-full p-3 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
              <button
                onClick={handleImportCsv}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                Execute Bulk Import
              </button>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                Export Book Catalog to CSV
              </h3>
              <p className="text-xs text-slate-500">
                Download the complete catalog records as standard CSV for offline academic reporting or backups.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <p>• Includes Title, ISBNs, Publisher, Year, and Pricing</p>
                <p>• Ready for Excel or Google Sheets</p>
              </div>
              <button
                onClick={handleExportCsv}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Catalog CSV</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Book Create / Edit Modal */}
      {bookModalOpen && (
        <BookEditModal
          book={selectedBookForEdit}
          categories={categories}
          token={token!}
          onClose={() => setBookModalOpen(false)}
          onSaved={() => {
            setBookModalOpen(false);
            loadBooks();
            loadStats();
            showSuccess(selectedBookForEdit ? 'Book updated' : 'Book created');
          }}
        />
      )}

      {/* Study Resource Create Modal */}
      {resModalOpen && (
        <ResourceCreateModal
          token={token!}
          onClose={() => setResModalOpen(false)}
          onSaved={() => {
            setResModalOpen(false);
            loadResources();
            loadStats();
            showSuccess('Study resource created');
          }}
        />
      )}
    </div>
  );
};

// Modal for adding or editing a book
const BookEditModal: React.FC<{
  book: Book | null;
  categories: Category[];
  token: string;
  onClose: () => void;
  onSaved: () => void;
}> = ({ book, categories, token, onClose, onSaved }) => {
  const [title, setTitle] = useState(book?.title || '');
  const [description, setDescription] = useState(book?.description || '');
  const [isbn10, setIsbn10] = useState(book?.isbn10 || '');
  const [isbn13, setIsbn13] = useState(book?.isbn13 || '');
  const [publisherName, setPublisherName] = useState(book?.publisherName || '');
  const [publicationYear, setPublicationYear] = useState(book?.publicationYear ? String(book.publicationYear) : '2023');
  const [edition, setEdition] = useState(book?.edition || '');
  const [difficultyLevel, setDifficultyLevel] = useState(book?.difficultyLevel || 'Intermediate');
  const [resourceType, setResourceType] = useState(book?.resourceType || 'Textbook');
  const [format, setFormat] = useState(book?.format || 'Paperback');
  const [price, setPrice] = useState(book?.price || '');
  const [isFree, setIsFree] = useState(book?.isFree || false);
  const [isFeatured, setIsFeatured] = useState(book?.isFeatured || false);
  const [coverImageUrl, setCoverImageUrl] = useState(book?.coverImageUrl || '');
  const [tableOfContents, setTableOfContents] = useState(book?.tableOfContents || '');
  const [targetAudience, setTargetAudience] = useState(book?.targetAudience || '');
  const [relatedSubjects, setRelatedSubjects] = useState(book?.relatedSubjects || '');
  const [authorNames, setAuthorNames] = useState(
    book?.authors ? book.authors.map((a) => a.name).join(', ') : ''
  );
  const [selectedCatId, setSelectedCatId] = useState<string>(
    book?.categories && book.categories.length > 0 ? String(book.categories[0].id) : ''
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and overview description are required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isbn10: isbn10.trim() || null,
        isbn13: isbn13.trim() || null,
        publisherName: publisherName.trim() || null,
        publicationYear: publicationYear ? parseInt(publicationYear) : null,
        edition: edition.trim() || null,
        difficultyLevel,
        resourceType,
        format,
        price: price.trim() || null,
        isFree,
        isFeatured,
        coverImageUrl: coverImageUrl.trim() || null,
        tableOfContents: tableOfContents.trim() || null,
        targetAudience: targetAudience.trim() || null,
        relatedSubjects: relatedSubjects.trim() || null,
        authorNames: authorNames ? authorNames.split(',').map((s) => s.trim()) : [],
        categoryIds: selectedCatId ? [parseInt(selectedCatId)] : [],
      };

      if (book) {
        await api.updateBook(book.id, payload, token);
      } else {
        await api.createBook(payload, token);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message || 'Save operation failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {book ? 'Edit Book Record' : 'Add New Book to Catalog'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400">✕</button>
        </div>

        {error && (
          <div className="m-5 p-3 rounded-xl bg-rose-50 text-rose-800 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Book Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Authors (comma separated)</label>
            <input
              type="text"
              value={authorNames}
              onChange={(e) => setAuthorNames(e.target.value)}
              placeholder="e.g. Thomas H. Cormen, Charles E. Leiserson"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Publisher</label>
              <input
                type="text"
                value={publisherName}
                onChange={(e) => setPublisherName(e.target.value)}
                placeholder="e.g. MIT Press, Pearson"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Category</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              >
                <option value="">-- Choose Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Publication Year</label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Edition</label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                placeholder="e.g. 4th Edition"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Difficulty</label>
              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ISBN-10</label>
              <input
                type="text"
                value={isbn10}
                onChange={(e) => setIsbn10(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">ISBN-13</label>
              <input
                type="text"
                value={isbn13}
                onChange={(e) => setIsbn13(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Image URL</label>
            <input
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Est. Price (INR)</label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 850"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isFree" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Free Legal Resource</label>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Feature on Home</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Book Description *</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Table of Contents</label>
            <textarea
              rows={3}
              value={tableOfContents}
              onChange={(e) => setTableOfContents(e.target.value)}
              placeholder="Chapter 1: ...&#10;Chapter 2: ..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none font-mono resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm"
            >
              {saving ? 'Saving...' : 'Save Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for creating a study resource
const ResourceCreateModal: React.FC<{
  token: string;
  onClose: () => void;
  onSaved: () => void;
}> = ({ token, onClose, onSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('Semester 3');
  const [university, setUniversity] = useState('');
  const [resourceType, setResourceType] = useState('Lecture Notes');
  const [sourceUrl, setSourceUrl] = useState('');
  const [authorOrOrg, setAuthorOrOrg] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !subject.trim() || !sourceUrl.trim()) return;
    try {
      setSaving(true);
      await api.createResource(
        {
          title: title.trim(),
          description: description.trim(),
          subject: subject.trim(),
          semester,
          university: university.trim() || null,
          resourceType,
          sourceUrl: sourceUrl.trim(),
          authorOrOrg: authorOrOrg.trim() || null,
        },
        token
      );
      onSaved();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Study Resource</h3>
          <button onClick={onClose} className="p-1 text-slate-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
            <input
              type="text"
              placeholder="e.g. Operating Systems, DBMS"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none"
              >
                <option value="Lecture Notes">Lecture Notes</option>
                <option value="Previous Year Question Paper">Previous Year Paper</option>
                <option value="Lab Manual">Lab Manual</option>
                <option value="Official Documentation">Official Docs</option>
                <option value="Free E-Book">Free E-Book</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Source URL *</label>
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description *</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-xs">Cancel</button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-xs font-bold bg-emerald-600 text-white rounded-xl"
            >
              {saving ? 'Saving...' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
