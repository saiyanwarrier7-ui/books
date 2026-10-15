import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Heart, ExternalLink, Flag, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                IT Study Hub
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed pr-4">
              A comprehensive academic learning resources portal engineered for Information Technology students. Discover verified textbooks, programming manuals, lecture notes, question archives, and accurate multi-source availability.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Academic Anti-Piracy Commitment:</strong> We link only to official publisher pages, accredited universities, and legal open-access resources.
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Browse Domains
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/books?category=programming-languages" className="hover:text-white transition-colors">
                  Programming Languages
                </Link>
              </li>
              <li>
                <Link to="/books?category=cs-fundamentals" className="hover:text-white transition-colors">
                  Computer Science Fundamentals
                </Link>
              </li>
              <li>
                <Link to="/books?category=database-management" className="hover:text-white transition-colors">
                  Database & SQL
                </Link>
              </li>
              <li>
                <Link to="/books?category=networking-cybersecurity" className="hover:text-white transition-colors">
                  Networking & Security
                </Link>
              </li>
              <li>
                <Link to="/books?category=cloud-devops" className="hover:text-white transition-colors">
                  Cloud & DevOps
                </Link>
              </li>
              <li>
                <Link to="/books?category=interview-prep" className="hover:text-white transition-colors">
                  Technical Interview Prep
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic & Resources */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Study Materials
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/resources?type=Lecture+Notes" className="hover:text-white transition-colors">
                  Semester Lecture Notes
                </Link>
              </li>
              <li>
                <Link to="/resources?type=Previous+Year+Question+Paper" className="hover:text-white transition-colors">
                  Previous Year Papers
                </Link>
              </li>
              <li>
                <Link to="/resources?type=Lab+Manual" className="hover:text-white transition-colors">
                  Laboratory Manuals
                </Link>
              </li>
              <li>
                <Link to="/resources?type=Official+Documentation" className="hover:text-white transition-colors">
                  Official Language Docs
                </Link>
              </li>
              <li>
                <Link to="/resources?type=Free+E-Book" className="hover:text-white transition-colors">
                  Open Textbooks & OER
                </Link>
              </li>
              <li>
                <Link to="/where-to-find" className="hover:text-white transition-colors">
                  Where to Find Locator
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Institution */}
          <div>
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Platform & Support
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About IT Study Hub
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">
                  Administrator Portal
                </Link>
              </li>
              <li>
                <Link to="/where-to-find" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-400" />
                  Report Outdated Link
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} IT Study Hub. Designed for Information Technology scholars.</p>
          <div className="flex items-center gap-6">
            <span>Verified Sources Only</span>
            <span>•</span>
            <span>Zero Piracy Policy</span>
            <span>•</span>
            <span>Open Access Advocate</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
