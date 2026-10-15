import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Book } from '../types.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';

interface BookCardProps {
  book: Book;
  onWhereToFindClick?: (book: Book) => void;
  onWishlistToggle?: (bookId: number, newState: boolean) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onWhereToFindClick,
  onWishlistToggle,
}) => {
  const { user, token } = useAuth();
  const [isSaved, setIsSaved] = useState(book.isSavedInWishlist || false);
  const [saving, setSaving] = useState(false);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) {
      alert('Please sign in or use Demo Student login to save books to your personal library.');
      return;
    }
    try {
      setSaving(true);
      if (isSaved) {
        await api.removeFromWishlist(book.id, token);
        setIsSaved(false);
        onWishlistToggle?.(book.id, false);
      } else {
        await api.addToWishlist(book.id, token);
        setIsSaved(true);
        onWishlistToggle?.(book.id, true);
      }
    } catch (err: any) {
      console.error('Wishlist error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Determine availability status indicator from first source or book properties
  const sources = book.availabilitySources || [];
  const hasDigitalFree = book.isFree || sources.some((s) => s.sourceType === 'Free / OER' || s.availabilityStatus === 'Digital Access');
  const hasInStock = sources.some((s) => s.availabilityStatus === 'Available');
  const hasLibrary = sources.some((s) => s.sourceType === 'University Library');

  const authorsDisplay = book.authors && book.authors.length > 0
    ? book.authors.map((a) => a.name).join(', ')
    : 'Academic Author';

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative">
      {/* Top badges bar */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center p-4">
        {/* Book Cover Image */}
        {book.coverImageUrl ? (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="h-full object-contain max-w-[140px] drop-shadow-md group-hover:scale-105 transition-transform duration-300 rounded"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-28 h-40 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-lg shadow-lg flex flex-col items-center justify-center p-3 text-white text-center">
            <BookOpen className="w-8 h-8 mb-2 opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-wider line-clamp-3">
              {book.title}
            </span>
          </div>
        )}

        {/* Free / Price tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {book.isFree ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Free Access
            </span>
          ) : book.price ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/80 backdrop-blur-md text-white shadow-sm">
              {book.currency === 'INR' ? '₹' : '$'}
              {book.price}
            </span>
          ) : null}

          {book.isFeatured && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white shadow-sm">
              Featured IT Classic
            </span>
          )}
        </div>

        {/* Wishlist Bookmark Button */}
        <button
          onClick={handleWishlist}
          disabled={saving}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isSaved
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
              : 'bg-white/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-amber-500 hover:scale-105 shadow-sm'
          }`}
          title={isSaved ? 'Saved in Personal Library' : 'Save to Personal Library'}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>

        {/* Resource Type Tag */}
        <div className="absolute bottom-2 right-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100/90 text-blue-800 dark:bg-blue-900/80 dark:text-blue-200 backdrop-blur-sm border border-blue-200/50 dark:border-blue-700/50">
            {book.resourceType}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Categories pill strip */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {book.categories && book.categories.slice(0, 2).map((cat) => (
              <span
                key={cat.id}
                className="text-[10px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-md"
              >
                {cat.name}
              </span>
            ))}
            {book.difficultyLevel && (
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                  book.difficultyLevel === 'Beginner'
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60'
                    : book.difficultyLevel === 'Advanced'
                    ? 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60'
                    : 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60'
                }`}
              >
                {book.difficultyLevel}
              </span>
            )}
          </div>

          {/* Title */}
          <Link to={`/books/${book.id}`}>
            <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
            by <span className="font-medium text-slate-700 dark:text-slate-300">{authorsDisplay}</span>
          </p>

          {/* Publisher & Edition */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            {book.publisherName && (
              <span className="flex items-center gap-1 truncate max-w-[130px]">
                <Building className="w-3 h-3 shrink-0" />
                {book.publisherName}
              </span>
            )}
            {book.publicationYear && (
              <span className="flex items-center gap-1 shrink-0">
                <Calendar className="w-3 h-3" />
                {book.publicationYear}
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
            {book.description}
          </p>
        </div>

        {/* Availability summary line */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
              Availability:
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium">
              {hasDigitalFree ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Free Digital
                </span>
              ) : hasInStock ? (
                <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> In Stock Online
                </span>
              ) : hasLibrary ? (
                <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> Library Access
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Check Sources
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              to={`/books/${book.id}`}
              className="w-full text-center py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              View Details
            </Link>
            <button
              onClick={() => onWhereToFindClick ? onWhereToFindClick(book) : null}
              className="w-full flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all"
            >
              <MapPin className="w-3.5 h-3.5" />
              Where to Find
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
