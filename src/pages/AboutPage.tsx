import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  Lock,
  Globe2,
  Heart,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Library Philosophy</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            About IT Study Hub
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Bridging Information Technology students, researchers, and faculties with authorized textbooks, legal open educational resources, and verified availability channels.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Zero Piracy Standard
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We never host or encourage unauthorized PDF downloads of commercial copyrighted textbooks. Every link routes to legitimate publishers, registered bookstores, or legal open-access author websites.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Verified Availability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We do not fabricate live warehouse inventory or fictional pricing. Every availability source records its last verified timestamp, pricing currency, and clear labeling between live listings and demonstration data.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Syllabus Mapped
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Curated for undergraduate Information Technology curricula covering Data Structures, Algorithms, Operating Systems, Computer Architecture, Networking, Database Management, and Cloud Engineering.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Where Does Our Availability Data Come From?
          </h2>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              Finding textbooks is often frustrating for students: links change, titles go out of stock, and unverified websites offer unsafe downloads. IT Study Hub solves this by organizing verified sources into four clear tiers:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Legitimate Online Retailers:</strong> We provide direct links to authentic bookstores like Amazon India, Flipkart, and Bookswagon with verified ISBN matches.
              </li>
              <li>
                <strong>Primary Academic Publishers:</strong> Direct institutional and individual purchase portals for MIT Press, Pearson Higher Education, O'Reilly Media, Wiley, McGraw-Hill, and No Starch Press.
              </li>
              <li>
                <strong>Open Educational Resources (OER):</strong> Creative Commons and open-access books like Pro Git, The Rust Book, Automate the Boring Stuff with Python, and official language documentations.
              </li>
              <li>
                <strong>Campus & City Libraries:</strong> Physical stack call numbers, university department library shelves, and college bookstore locations so students can check out books on campus.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
