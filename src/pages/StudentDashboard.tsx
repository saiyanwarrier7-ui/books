import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  Clock,
  User,
  Trash2,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { WishlistItem, ReadingListItem } from '../types.ts';
import { api } from '../lib/api.ts';

export const StudentDashboard: React.FC = () => {
  const { user, profile, token, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'wishlist' | 'reading-lists' | 'profile'>('wishlist');
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [readingFilter, setReadingFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Profile Edit
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    const loadUserData = async () => {
      try {
        setLoading(true);
        const [wList, rList] = await Promise.all([
          api.getWishlist(token),
          api.getReadingLists(token),
        ]);
        setWishlist(wList);
        setReadingList(rList);
        if (profile?.fullName) setFullName(profile.fullName);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, [token, profile]);

  const handleRemoveWishlist = async (bookId: number) => {
    if (!token) return;
    try {
      await api.removeFromWishlist(bookId, token);
      setWishlist((prev) => prev.filter((item) => item.book.id !== bookId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveReading = async (id: number) => {
    if (!token) return;
    try {
      await api.removeFromReadingList(id, token);
      setReadingList((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateReadingStatus = async (bookId: number, status: string) => {
    if (!token) return;
    try {
      await api.saveToReadingList({ bookId, status }, token);
      const updated = await api.getReadingLists(token);
      setReadingList(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      setSavingProfile(true);
      await api.updateProfile(fullName, token);
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage(err.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  if (!user && !token) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center">
        <div className="max-w-md mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <GraduationCap className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Sign-In Required</h2>
          <p className="text-xs text-slate-500">Sign in to access your personal academic library, wishlist, and study goals.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const filteredReading = readingList.filter((item) => {
    if (readingFilter === 'All') return true;
    return item.status === readingFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-extrabold text-2xl uppercase shadow-md">
              {profile?.fullName ? profile.fullName.charAt(0) : user?.email?.charAt(0) || 'S'}
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/30 text-blue-300 border border-blue-400/30">
                {profile?.role === 'admin' ? 'Academic Administrator' : 'IT Student Scholar'}
              </span>
              <h1 className="text-2xl font-bold mt-1">
                {profile?.fullName || user?.displayName || 'Student Scholar'}
              </h1>
              <p className="text-xs text-slate-300">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
            <div>
              <div className="text-xl font-bold">{wishlist.length}</div>
              <div className="text-[11px] text-slate-300">Saved Books</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-xl font-bold">{readingList.length}</div>
              <div className="text-[11px] text-slate-300">In Reading Lists</div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'wishlist'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reading-lists')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'reading-lists'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Reading Lists ({readingList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Settings</span>
          </button>
        </div>

        {/* Tab 1: Wishlist */}
        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-48 bg-white dark:bg-slate-900 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : wishlist.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Click the bookmark icon on any book card to save it here for reference.</p>
                <Link to="/books" className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white">
                  Browse Books Now
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map(({ book }) => (
                  <div
                    key={book.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-22 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                        {book.coverImageUrl ? (
                          <img src={book.coverImageUrl} alt={book.title} className="h-full object-contain" />
                        ) : (
                          <BookOpen className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="space-y-1 flex-1">
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                          {book.resourceType}
                        </span>
                        <Link to={`/books/${book.id}`} className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 hover:underline">
                          {book.title}
                        </Link>
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {book.authors?.map((a) => a.name).join(', ') || 'Author'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <Link
                        to={`/books/${book.id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleRemoveWishlist(book.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reading Lists */}
        {activeTab === 'reading-lists' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Filter Status:</span>
              {['All', 'Want to Read', 'Currently Reading', 'Completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setReadingFilter(status)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    readingFilter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {filteredReading.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <Clock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No books in this reading list</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">Set reading goals on any book detail page.</p>
                <Link to="/books" className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white">
                  Browse Books
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReading.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        {item.book ? (
                          <Link to={`/books/${item.book.id}`} className="font-bold text-sm text-slate-900 dark:text-white hover:underline">
                            {item.book.title}
                          </Link>
                        ) : (
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</span>
                        )}
                        <span className={`inline-block ml-3 px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : item.status === 'Currently Reading'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.book && (
                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateReadingStatus(item.book!.id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-none outline-none cursor-pointer"
                        >
                          <option value="Want to Read">Want to Read</option>
                          <option value="Currently Reading">Currently Reading</option>
                          <option value="Completed">Completed</option>
                        </select>
                      )}
                      <button
                        onClick={() => handleRemoveReading(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Profile Details</h3>

            {profileMessage && (
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                {profileMessage}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Role
                </label>
                <input
                  type="text"
                  value={profile?.role || 'student'}
                  disabled
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 capitalize cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              >
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
