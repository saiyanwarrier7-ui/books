import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Search,
  Store,
  Building,
  Library,
  Sparkles,
  ExternalLink,
  Calendar,
  AlertTriangle,
  Flag,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { AvailabilitySource } from '../types.ts';
import { api } from '../lib/api.ts';
import { ReportLinkModal } from '../components/ReportLinkModal.tsx';

export const WhereToFindPage: React.FC = () => {
  const [sources, setSources] = useState<AvailabilitySource[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [sourceType, setSourceType] = useState('All');
  const [locationInput, setLocationInput] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');

  // Report modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<AvailabilitySource | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};
        if (query.trim()) params.q = query.trim();
        if (sourceType !== 'All') params.sourceType = sourceType;
        if (locationInput.trim()) params.location = locationInput.trim();
        if (availabilityFilter !== 'All') params.availabilityStatus = availabilityFilter;

        const data = await api.searchAvailability(params);
        setSources(data);
      } catch (err) {
        console.error('Failed to load availability listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, [query, sourceType, locationInput, availabilityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const sourceTypes = [
    'All',
    'Online Store',
    'Official Publisher',
    'Free / OER',
    'University Library',
    'Physical Bookstore',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Multi-Source Availability Directory</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Where to Find IT Books & Resources
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Find verified availability across legitimate online stores (Amazon India, Flipkart, Bookswagon), publisher catalogs (MIT Press, Pearson, Wiley), university library call numbers, and local academic bookstores.
            </p>
          </div>
        </div>

        {/* Search & Location Bar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by book title or platform name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Enter city, PIN code, or campus library..."
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Source Type:</span>
            {sourceTypes.map((st) => (
              <button
                key={st}
                onClick={() => setSourceType(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  sourceType === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No availability sources found
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your book title, city, or source type filters.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                <div className="flex items-start gap-4 flex-1">
                  {/* Thumbnail */}
                  <div className="w-14 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                    {src.bookCover ? (
                      <img src={src.bookCover} alt={src.bookTitle || 'Book'} className="h-full object-contain" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/books/${src.bookId}`}
                        className="font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 line-clamp-1"
                      >
                        {src.bookTitle}
                      </Link>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {src.sourceType}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {src.sourceType === 'Online Store' && <Store className="w-4 h-4 text-blue-500" />}
                      {src.sourceType === 'Official Publisher' && <Building className="w-4 h-4 text-purple-500" />}
                      {src.sourceType === 'Free / OER' && <Sparkles className="w-4 h-4 text-emerald-500" />}
                      {src.sourceType === 'University Library' && <Library className="w-4 h-4 text-indigo-500" />}
                      {src.sourceType === 'Physical Bookstore' && <MapPin className="w-4 h-4 text-amber-500" />}
                      <span>{src.sourceName}</span>
                      <span className="text-slate-400 font-normal">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {src.availabilityStatus}
                      </span>
                    </div>

                    {src.location && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{src.location}</span>
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      {src.price && (
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {src.price}
                        </span>
                      )}
                      {src.lastCheckedAt && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" /> Checked: {src.lastCheckedAt}
                        </span>
                      )}
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        • {src.verificationStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
                  <a
                    href={src.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      setSelectedSource(src);
                      setReportModalOpen(true);
                    }}
                    title="Report outdated price or broken link"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 transition-colors"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReportLinkModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        source={selectedSource}
      />
    </div>
  );
};
