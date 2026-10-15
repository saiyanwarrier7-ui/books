import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Building,
  Calendar,
  Globe,
  Tag,
  ExternalLink,
  Store,
  Library,
  MapPin,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Flag,
  Share2,
  Sparkles,
  ArrowLeft,
  ListOrdered,
  Users,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { Book, AvailabilitySource } from '../types.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ReportLinkModal } from '../components/ReportLinkModal.tsx';

export const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [readingStatus, setReadingStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Source type filter in Where to Find section
  const [sourceTypeFilter, setSourceTypeFilter] = useState('All');
  const [locationSearch, setLocationSearch] = useState('');

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedReportSource, setSelectedReportSource] = useState<AvailabilitySource | null>(null);

  // Table of Contents toggle
  const [tocExpanded, setTocExpanded] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.getBookById(id, token);
        setBook(res.book);
        setRelatedBooks(res.relatedBooks || []);
        setInWishlist(res.userContext?.inWishlist || false);
        setReadingStatus(res.userContext?.readingStatus || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load book details');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, token]);

  const handleWishlistToggle = async () => {
    if (!book) return;
    if (!token) {
      alert('Please sign in or use Demo Student login to bookmark books.');
      return;
    }
    try {
      if (inWishlist) {
        await api.removeFromWishlist(book.id, token);
        setInWishlist(false);
      } else {
        await api.addToWishlist(book.id, token);
        setInWishlist(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadingStatusChange = async (newStatus: string) => {
    if (!book) return;
    if (!token) {
      alert('Please sign in to update your reading list status.');
      return;
    }
    try {
      await api.saveToReadingList({ bookId: book.id, status: newStatus }, token);
      setReadingStatus(newStatus);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 flex justify-center">
        <div className="max-w-4xl w-full space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Book Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">{error || 'The requested catalog item does not exist.'}</p>
          <Link
            to="/books"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white"
          >
            Back to Book Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Filter availability sources
  const allSources = book.availabilitySources || [];
  const filteredSources = allSources.filter((s) => {
    if (sourceTypeFilter !== 'All' && s.sourceType !== sourceTypeFilter) return false;
    if (locationSearch.trim()) {
      const q = locationSearch.toLowerCase();
      const locMatch = s.location?.toLowerCase().includes(q);
      const nameMatch = s.sourceName.toLowerCase().includes(q);
      if (!locMatch && !nameMatch) return false;
    }
    return true;
  });

  const authorsString = book.authors && book.authors.length > 0
    ? book.authors.map((a) => a.name).join(', ')
    : 'Unknown Author';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/books" className="hover:text-blue-600">Books</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-xs">{book.title}</span>
        </div>

        {/* Top Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Book Cover Column */}
            <div className="lg:col-span-4 flex flex-col items-center">
              <div className="w-56 sm:w-64 aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700">
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-full object-contain drop-shadow"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 rounded-xl flex flex-col items-center justify-center p-4 text-white text-center">
                    <BookOpen className="w-12 h-12 mb-2 opacity-80" />
                    <span className="text-xs font-bold uppercase tracking-wider">{book.title}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Wishlist & Reading Status */}
              <div className="w-full max-w-xs mt-6 space-y-3">
                <button
                  onClick={handleWishlistToggle}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    inWishlist
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  <span>{inWishlist ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                </button>

                {/* Reading Status Selector */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">
                    My Reading Status
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    {['Want to Read', 'Currently Reading', 'Completed'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleReadingStatusChange(st)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-semibold text-center transition-colors ${
                          readingStatus === st
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Book Metadata Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {book.resourceType}
                </span>
                {book.difficultyLevel && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {book.difficultyLevel} Level
                  </span>
                )}
                {book.isFree ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Verified Free Resource
                  </span>
                ) : book.price ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                    Est. {book.currency === 'INR' ? '₹' : '$'}{book.price}
                  </span>
                ) : null}
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {book.verificationStatus || 'Verified'}
                </span>
              </div>

              {/* Title & Author */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                  Authored by <span className="font-semibold text-blue-600 dark:text-blue-400">{authorsString}</span>
                </p>
              </div>

              {/* Publication Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Publisher</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {book.publisherName || 'Academic Press'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Publication Year</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {book.publicationYear || 'N/A'} {book.edition ? `(${book.edition})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Format & Language</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {book.format || 'Paperback'} • {book.language || 'English'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">ISBN-10 / ISBN-13</span>
                  <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                    {book.isbn10 || 'N/A'} / {book.isbn13 || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Book Overview & Syllabus Relevance
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* Target Audience & Related Subjects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl">
                {book.targetAudience && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                      Target Audience
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {book.targetAudience}
                    </p>
                  </div>
                )}
                {book.relatedSubjects && (
                  <div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-1">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Related Academic Subjects
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {book.relatedSubjects}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Jump to Where to Find */}
              <div className="pt-2">
                <a
                  href="#where-to-find"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Check Availability & Purchase Options ({allSources.length})</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents Section */}
        {book.tableOfContents && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-blue-600" />
                Table of Contents & Core Topics
              </h2>
              <button
                onClick={() => setTocExpanded(!tocExpanded)}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                {tocExpanded ? 'Collapse' : 'Expand'}
              </button>
            </div>
            {tocExpanded && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed border border-slate-100 dark:border-slate-800">
                {book.tableOfContents}
              </div>
            )}
          </div>
        )}

        {/* 6. WHERE TO FIND THIS BOOK (CRITICAL FEATURE) */}
        <section id="where-to-find" className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-blue-500/30 dark:border-blue-600/40 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Genuine Sourcing Directory
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  {allSources.length} Channels Verified
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Where to Find This Book
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
                Compare legitimate online stores, publisher direct pages, free open educational editions, and university library catalog records.
              </p>
            </div>

            {/* Report link button */}
            <button
              onClick={() => {
                setSelectedReportSource(null);
                setReportModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-amber-600 hover:border-amber-300 transition-colors shrink-0"
            >
              <Flag className="w-3.5 h-3.5 text-amber-500" />
              <span>Report Broken or Outdated Link</span>
            </button>
          </div>

          {/* Sourcing Channel Filters & Location Search */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {['All', 'Online Store', 'Official Publisher', 'Free / OER', 'University Library', 'Physical Bookstore'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSourceTypeFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    sourceTypeFilter === st
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Location filter */}
            <div className="relative w-full sm:w-64 ml-auto">
              <input
                type="text"
                placeholder="Filter by city or campus..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
            </div>
          </div>

          {/* Sources List */}
          {filteredSources.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
              <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No sources match your current filter.
              </p>
              <button
                onClick={() => { setSourceTypeFilter('All'); setLocationSearch(''); }}
                className="text-xs text-blue-600 mt-2 font-semibold hover:underline"
              >
                Reset source filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSources.map((source) => (
                <div
                  key={source.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
                        {source.sourceType === 'Online Store' && <Store className="w-4 h-4 text-blue-500" />}
                        {source.sourceType === 'Official Publisher' && <Building className="w-4 h-4 text-purple-500" />}
                        {source.sourceType === 'Free / OER' && <Sparkles className="w-4 h-4 text-emerald-500" />}
                        {source.sourceType === 'University Library' && <Library className="w-4 h-4 text-indigo-500" />}
                        {source.sourceType === 'Physical Bookstore' && <MapPin className="w-4 h-4 text-amber-500" />}
                        {source.sourceName}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        source.availabilityStatus === 'Available'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : source.availabilityStatus === 'Digital Access'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : source.availabilityStatus === 'Library Listing'
                          ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {source.availabilityStatus}
                      </span>

                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        ({source.sourceType})
                      </span>
                    </div>

                    {source.location && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{source.location}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      {source.price && (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          Price: {source.price}
                        </span>
                      )}
                      {source.lastCheckedAt && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          Last Checked: {source.lastCheckedAt}
                        </span>
                      )}
                      <span className={`text-[11px] font-semibold ${
                        source.verificationStatus === 'Verified'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        • {source.verificationStatus}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                    >
                      <span>Visit Source</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        setSelectedReportSource(source);
                        setReportModalOpen(true);
                      }}
                      title="Report outdated price or broken link"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 transition-colors"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Policy disclaimer */}
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
            <strong>Transparency Notice:</strong> IT Study Hub aggregates verified links to legal platforms. Live inventory and prices are refreshed periodically from official seller portals. If a link has expired or a price has changed, please report it via the flag button above.
          </div>
        </section>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              Alternative & Related Books
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map((rb) => (
                <Link
                  key={rb.id}
                  to={`/books/${rb.id}`}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all group flex flex-col justify-between"
                >
                  <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2">
                    {rb.coverImageUrl ? (
                      <img src={rb.coverImageUrl} alt={rb.title} className="h-full object-contain" />
                    ) : (
                      <BookOpen className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600">
                      {rb.title}
                    </h4>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      {rb.isFree ? 'Free Access' : rb.price ? `₹${rb.price}` : 'Check price'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportLinkModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        book={book}
        source={selectedReportSource}
      />
    </div>
  );
};
