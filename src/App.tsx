import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { BooksPage } from './pages/BooksPage.tsx';
import { BookDetailsPage } from './pages/BookDetailsPage.tsx';
import { CategoriesPage } from './pages/CategoriesPage.tsx';
import { ResourcesPage } from './pages/ResourcesPage.tsx';
import { WhereToFindPage } from './pages/WhereToFindPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased selection:bg-blue-500 selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/books" element={<BooksPage />} />
                <Route path="/books/:id" element={<BookDetailsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/where-to-find" element={<WhereToFindPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />

                {/* Student Pages */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/wishlist" element={<StudentDashboard />} />
                <Route path="/student/reading-lists" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentDashboard />} />

                {/* Admin Pages */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/books" element={<AdminDashboard />} />
                <Route path="/admin/books/create" element={<AdminDashboard />} />
                <Route path="/admin/categories" element={<AdminDashboard />} />
                <Route path="/admin/resources" element={<AdminDashboard />} />
                <Route path="/admin/availability" element={<AdminDashboard />} />
                <Route path="/admin/reports" element={<AdminDashboard />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
