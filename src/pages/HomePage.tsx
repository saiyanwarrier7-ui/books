import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Code2,
  Terminal,
  Database,
  Server,
  Cloud,
  Layers,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Library,
  Compass,
  UserPlus,
} from 'lucide-react';
import { Book, Category, StudyResource } from '../types.ts';
import { api } from '../lib/api.ts';
import { BookCard } from '../components/BookCard.tsx';
import { WhereToFindModal } from '../components/WhereToFindModal.tsx';
import { ReportLinkModal } from '../components/ReportLinkModal.tsx';

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [freeBooks, setFreeBooks] = useState<Book[]>([]);
  const [studyNotes, setStudyNotes] = useState<StudyResource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalBook, setModalBook] = useState<Book | null>(null);
  const [whereToFindOpen, setWhereToFindOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [booksRes, freeRes, notesRes, catRes] = await Promise.all([
          api.getBooks({ featured: 'true', limit: '6' }),
          api.getBooks({ isFree: 'true', limit: '4' }),
          api.getResources({ limit: '4' }),
          api.getCategories(),
        ]);
        setFeaturedBooks(booksRes.books);
        setFreeBooks(freeRes.books);
        setStudyNotes(notesRes.slice(0, 4));
        setCategories(catRes.slice(0, 8));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const handleOpenWhereToFind = (book: Book) => {
    setModalBook(book);
    setWhereToFindOpen(true);
  };

  const domainCards = [
    { name: 'Programming Languages', slug: 'programming-languages', count: 'C, C++, Java, Python, Rust, Go', icon: Terminal, color: 'from-blue-600 to-cyan-600' },
    { name: 'CS Fundamentals', slug: 'cs-fundamentals', count: 'DSA, OS, Architecture, Automata', icon: Layers, color: 'from-indigo-600 to-purple-600' },
    { name: 'Web Development', slug: 'web-development', count: 'React, Node, Full-Stack, REST', icon: Code2, color: 'from-sky-600 to-blue-700' },
    { name: 'Database Systems', slug: 'database-management', count: 'SQL, PostgreSQL, MongoDB, Design', icon: Database, color: 'from-emerald-600 to-teal-700' },
    { name: 'Networking & Security', slug: 'networking-cybersecurity', count: 'TCP/IP, Cryptography, Ethical Hacking', icon: ShieldCheck, color: 'from-rose-600 to-pink-700' },
    { name: 'Cloud & DevOps', slug: 'cloud-devops', count: 'AWS, Docker, Kubernetes, Linux, Git', icon: Cloud, color: 'from-violet-600 to-purple-800' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-slate-950 text-white py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/40">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[250px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Academic IT Library & Learning Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Your IT Learning Journey{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Starts Here.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Discover IT textbooks, programming guides, academic notes, and trusted learning resources in one place.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search books, authors, subjects, or ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base rounded-xl bg-transparent text-white placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Books</span>
            </button>
          </form>

          {/* Quick CTA Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border border-blue-400/40 backdrop-blur-md shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Register with Google</span>
            </Link>
            <Link
              to="/books"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>Browse All Books</span>
            </Link>
            <Link
              to="/resources"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Explore Free Resources</span>
            </Link>
            <Link
              to="/where-to-find"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Library className="w-4 h-4 text-purple-400" />
              <span>Where to Find</span>
            </Link>
          </div>
        </div>

        {/* Live Catalog Counter Strip */}
        <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-indigo-900/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">100% Legal</div>
            <div className="text-xs text-slate-400 mt-1">Verified & Open Sources</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">18+ Domains</div>
            <div className="text-xs text-slate-400 mt-1">From C to Rust & Cloud</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">Free Access</div>
            <div className="text-xs text-slate-400 mt-1">Official Docs & OER Books</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">Multi-Channel</div>
            <div className="text-xs text-slate-400 mt-1">Stores, Publishers & Libraries</div>
          </div>
        </div>
      </section>

      {/* 2. Verified Transparency Banner */}
      <section className="bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/60 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>Verified Availability Transparency:</strong> We display legitimate bookstore links (Amazon India, Bookswagon, Flipkart), direct publisher links (MIT Press, Pearson, O'Reilly), and official university library records. Sample demonstration listings are explicitly marked.
            </span>
          </div>
          <Link to="/about" className="text-blue-700 dark:text-blue-400 font-semibold hover:underline shrink-0">
            Learn Our Verification Standards →
          </Link>
        </div>
      </section>

      {/* 3. Browse by Core IT Domains */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Curriculum & Disciplines
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Explore by IT Subject
            </h2>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {domainCards.map((domain) => {
            const Icon = domain.icon;
            return (
              <Link
                key={domain.slug}
                to={`/books?category=${domain.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all flex items-start gap-4"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${domain.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {domain.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {domain.count}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-2">
                    Browse Books <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Popular & Essential Textbooks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Core Academic Reading
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300">
                Verified Syllabus Texts
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Essential Textbooks for IT Students
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Standard foundational literature referenced by university curriculums and tech companies globally.
            </p>
          </div>
          <Link
            to="/books"
            className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onWhereToFindClick={handleOpenWhereToFind}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Free Legal E-Books & Open Educational Resources (OER) */}
      <section className="bg-slate-100/70 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Open Access & Zero Cost
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  100% Free Legally
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Free Legal E-Books & Programming Guides
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Creative Commons books published with full authorized online access by their authors and foundations.
              </p>
            </div>
            <Link
              to="/resources"
              className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explore All Free Resources</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onWhereToFindClick={handleOpenWhereToFind}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Subject-Wise Study Materials (Lecture Notes & Question Papers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Exam Prep & Practical Manuals
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Semester Notes & Lab Manuals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curated lecture notes, solved previous year papers, and practical files mapped to Indian & international IT university syllabi.
            </p>
          </div>
          <Link
            to="/resources"
            className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Notes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {studyNotes.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-300 dark:hover:border-purple-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                    {res.resourceType}
                  </span>
                  {res.semester && (
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {res.semester}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                  {res.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-3">
                  <span><strong>Subject:</strong> {res.subject}</span>
                  {res.university && (
                    <span>• {res.university}</span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {res.verificationStatus}
                </span>
                <a
                  href={res.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                >
                  <span>Access Resource</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Official Documentation Showcase */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Zero-Noise Primary Literature
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">
              Always Learn from the Primary Documentation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Before reaching for secondary blog posts, master the official language specifications and architectural references maintained directly by the language creators.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://docs.python.org/3/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-2"
            >
              <span>Python 3 Docs</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
            <a
              href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-2"
            >
              <span>MDN Web Docs</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
            <a
              href="https://doc.rust-lang.org/book/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-2"
            >
              <span>The Rust Book</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
            <a
              href="https://git-scm.com/book/en/v2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold backdrop-blur-md flex items-center gap-2"
            >
              <span>Pro Git 2nd Ed.</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Modals */}
      <WhereToFindModal
        book={modalBook}
        isOpen={whereToFindOpen}
        onClose={() => setWhereToFindOpen(false)}
        onOpenReportModal={(b, src) => {
          setWhereToFindOpen(false);
          setModalBook(b);
          setReportOpen(true);
        }}
      />

      <ReportLinkModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        book={modalBook}
      />
    </div>
  );
};
