import React from 'react';
import {
  X,
  ExternalLink,
  Store,
  Building2,
  Sparkles,
  Library,
  MapPin,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Flag,
} from 'lucide-react';
import { Book, AvailabilitySource } from '../types.ts';

interface WhereToFindModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReportModal?: (book: Book, source?: AvailabilitySource) => void;
}

export const WhereToFindModal: React.FC<WhereToFindModalProps> = ({
  book,
  isOpen,
  onClose,
  onOpenReportModal,
}) => {
  if (!isOpen || !book) return null;

  const sources = book.availabilitySources || [];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'Online Store':
        return <Store className="w-4 h-4 text-blue-500" />;
      case 'Official Publisher':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'Free / OER':
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
      case 'University Library':
        return <Library className="w-4 h-4 text-indigo-500" />;
      case 'Physical Bookstore':
        return <MapPin className="w-4 h-4 text-amber-500" />;
      default:
        return <Store className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            Available / In Stock
          </span>
        );
      case 'Digital Access':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300">
            Digital Access / E-Book
          </span>
        );
      case 'Library Listing':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
            Campus Library Shelf
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300">
            Temporarily Out of Stock
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Verified Availability Sources
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {sources.length} {sources.length === 1 ? 'Source' : 'Sources'} Found
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">
              {book.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compare legitimate online stores, publisher pages, library stacks, and free OER editions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sources List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sources.length === 0 ? (
            <div className="text-center py-10">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No verified sources listed yet for this title.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Our academic catalog team regularly checks availability. You can search directly on legitimate retail platforms.
              </p>
            </div>
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                      {getSourceIcon(source.sourceType)}
                      {source.sourceName}
                    </div>
                    {getStatusBadge(source.availabilityStatus)}
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {source.sourceType}
                    </span>
                  </div>

                  {/* Location / Wing */}
                  {source.location && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{source.location}</span>
                    </p>
                  )}

                  {/* Pricing and verification date */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    {source.price && (
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Price: {source.price}
                      </span>
                    )}
                    {source.lastCheckedAt && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        Checked: {source.lastCheckedAt}
                      </span>
                    )}
                    <span className={`text-[11px] font-medium ${
                      source.verificationStatus === 'Verified'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      • {source.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all shrink-0"
                  >
                    <span>Visit Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {onOpenReportModal && (
                    <button
                      onClick={() => onOpenReportModal(book, source)}
                      title="Report incorrect price or broken link"
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-300 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info notice */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>We do not claim live real-time warehouse inventory. Always verify at checkout.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl font-medium bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
