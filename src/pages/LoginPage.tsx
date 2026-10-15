import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  BookOpen,
  Shield,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  UserPlus,
  LogIn,
  Check,
  Mail,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const {
    user,
    loginWithGoogle,
    registerWithGoogle,
    registerGoogleEmail,
    loginAsDemoStudent,
    loginAsDemoAdmin,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isSignupRoute = location.pathname === '/signup' || location.pathname === '/register';
  const queryParams = new URLSearchParams(location.search);
  const isAdminPrompt = queryParams.get('admin') === 'true';

  const [mode, setMode] = useState<'login' | 'register'>(isSignupRoute ? 'register' : 'login');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [studentFullName, setStudentFullName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname === '/signup' || location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  // 1-Click Google Popup Action
  const handleGooglePopupAction = async () => {
    try {
      setLoading(true);
      setError('');
      if (mode === 'register') {
        await registerWithGoogle(studentFullName.trim() || undefined);
        setSuccessMsg('Google Account registered successfully! Redirecting...');
      } else {
        await loginWithGoogle();
        setSuccessMsg('Signed in with Google! Redirecting...');
      }
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 700);
    } catch (err: any) {
      console.warn('Google Popup result:', err);
      setError(
        err.message?.includes('popup')
          ? 'Browser popup was blocked. You can register your Google email directly using the form below, or use Instant Demo Access.'
          : err.message || 'Google authentication was not completed.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Direct Google Email Registration (works even if popup is blocked)
  const handleDirectGoogleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput.trim()) {
      setError('Please enter your Google account email address.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await registerGoogleEmail(googleEmailInput.trim(), studentFullName.trim() || undefined);
      setSuccessMsg('Google Account registered successfully! Opening your student dashboard...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoStudent = () => {
    loginAsDemoStudent();
    navigate('/student/dashboard');
  };

  const handleDemoAdmin = () => {
    loginAsDemoAdmin();
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-14 px-4 flex items-center justify-center transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isAdminPrompt
              ? 'Academic Admin Portal'
              : mode === 'register'
              ? 'Register with Google Account'
              : 'Sign In to IT Study Hub'}
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            {isAdminPrompt
              ? 'Authorized academic administrator login for catalog and resource management'
              : mode === 'register'
              ? 'Register your Google Account to create your free student library, save textbooks, and track syllabus notes.'
              : 'Sign in to access your saved textbooks, wishlist, reading lists, and verified IT resources.'}
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Register (Hidden on Admin Prompt) */}
        {!isAdminPrompt && (
          <div className="flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>{error}</span>
          </div>
        )}

        {/* PRIMARY 1-CLICK GOOGLE BUTTON */}
        <div className="space-y-3">
          <button
            onClick={handleGooglePopupAction}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer ${
              mode === 'register'
                ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/25 ring-2 ring-blue-500/30'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            {/* Google Logo */}
            <div className="w-5 h-5 bg-white rounded-full p-0.5 flex items-center justify-center shrink-0 shadow-xs">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <span>
              {loading
                ? 'Connecting...'
                : mode === 'register'
                ? 'Register with Google Account (1-Click)'
                : 'Sign in with Google Account'}
            </span>
          </button>
        </div>

        {/* DIRECT GOOGLE ACCOUNT REGISTRATION FORM */}
        {!isAdminPrompt && (
          <div className="pt-2">
            <div className="relative py-2 mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold text-[11px]">
                  {mode === 'register' ? 'Or Enter Google Account' : 'Or Sign in by Email'}
                </span>
              </div>
            </div>

            <form onSubmit={handleDirectGoogleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Google Account Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>

                {/* Quick autofill chip for current user */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Quick fill:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput('saiyanwarrier7@gmail.com');
                      if (!studentFullName) setStudentFullName('Saiyan Warrier');
                    }}
                    className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/80 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                  >
                    saiyanwarrier7@gmail.com
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Student / Scholar Name (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Saiyan Warrier"
                      value={studentFullName}
                      onChange={(e) => setStudentFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
              >
                {loading
                  ? 'Processing...'
                  : mode === 'register'
                  ? 'Register Google Account'
                  : 'Sign In to Student Account'}
              </button>
            </form>
          </div>
        )}

        {/* Benefits list on Register Mode */}
        {mode === 'register' && !isAdminPrompt && (
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-[11px] uppercase tracking-wider text-blue-700 dark:text-blue-300 block">
              Registered Student Benefits:
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Save IT books and textbooks to your personal wishlist</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Track Want-to-Read, Currently Reading & Completed goals</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>100% Free academic account — zero hidden fees</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle footer links */}
        {!isAdminPrompt && (
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
            {mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Sign in with Google
                </button>
              </p>
            ) : (
              <p>
                New student scholar?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Register with Google Account
                </button>
              </p>
            )}
          </div>
        )}

        {/* Instant Demo Access (Ensures 100% testability) */}
        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-semibold text-[10px]">
              Instant Demo Access
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleDemoStudent}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Login as Demo Student</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDemoAdmin}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all text-xs font-semibold cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Login as Academic Admin</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-center text-slate-400">
          Public browsing, searching, and where-to-find directories never require an account.
        </p>
      </div>
    </div>
  );
};
