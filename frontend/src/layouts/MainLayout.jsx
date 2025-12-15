import { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SearchBar from '../components/SearchBar';

const MainLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Desktop dropdown for "Menu"
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile hamburger menu
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-secondary text-text font-sans selection:bg-primary/30 selection:text-white transition-colors duration-300">
            <nav className="bg-secondary/95 backdrop-blur-xl sticky top-0 z-50 border-b border-black/5 dark:border-white/5 shadow-sm dark:shadow-2xl transition-all duration-300">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center relative">
                        {/* Logo */}
                        <Link to="/" className="group flex items-center gap-1 z-20" onClick={() => setIsMobileMenuOpen(false)}>
                            <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 drop-shadow-sm group-hover:from-red-500 group-hover:to-orange-400 transition-all duration-300">
                                FilmFlow
                            </span>
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] group-hover:scale-150 transition-transform duration-300"></div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <div className="flex items-center gap-6 text-sm font-medium tracking-wide">
                                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all">Home</Link>

                                {/* Desktop Menu Dropdown */}
                                <div className="relative group">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className={`flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all ${isMenuOpen ? 'text-black dark:text-white' : ''}`}
                                    >
                                        Browse
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                            <div className="absolute top-full left-0 mt-4 w-48 bg-surface border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-20 py-2 overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in zoom-in-95 duration-200">
                                                <div className="px-5 py-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Categories</div>
                                                <a href="/#new" className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>New Releases</a>
                                                <a href="/#top" className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Top Rated</a>
                                                <Link to="/movies" className="px-5 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>All Movies</Link>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <Link to="/movies" className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-105 active:scale-95 transition-all">Movies</Link>
                            </div>

                            <SearchBar />

                            {/* User Section (Desktop) */}
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200 dark:border-white/10">
                                {user ? (
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                            className="flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-full transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <span className="font-medium hidden md:block text-gray-700 dark:text-gray-200">{user.username}</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}>
                                                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {isProfileDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-2xl border border-black/10 dark:border-white/10 py-2 overflow-hidden z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Signed in as</p>
                                                    <p className="text-sm font-bold truncate text-gray-800 dark:text-white">{user.email}</p>
                                                </div>

                                                <div className="p-2 space-y-1">
                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                        onClick={() => setIsProfileDropdownOpen(false)}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A7.501 7.501 0 014.501 20.118z" />
                                                        </svg>
                                                        My Profile
                                                    </Link>

                                                    <button
                                                        onClick={() => toggleTheme()}
                                                        className="flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {theme === 'dark' ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-yellow-500">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                                                </svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                                                </svg>
                                                            )}
                                                            <span>Appearance</span>
                                                        </div>
                                                        <span className="text-xs font-medium bg-black/5 dark:bg-white/10 px-2 py-1 rounded capitalize">{theme}</span>
                                                    </button>

                                                    <div className="h-px bg-gray-200 dark:bg-white/5 my-1"></div>

                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                                        </svg>
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors">Login</Link>
                                        <Link to="/register" className="px-5 py-2 text-sm font-bold bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/10 dark:shadow-white/10">
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className="md:hidden relative z-20 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white p-2"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-secondary border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5 duration-200">
                        <div className="flex flex-col p-4 gap-4">
                            <div className="pb-4 border-b border-white/5">
                                <SearchBar fullWidth />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Link to="/" className="p-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                                <Link to="/movies" className="p-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all" onClick={() => setIsMobileMenuOpen(false)}>All Movies</Link>
                                <div className="p-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                    Browse Categories
                                    {isMenuOpen && (
                                        <div className="ml-4 mt-2 flex flex-col gap-2 border-l border-white/10 pl-4">
                                            <a href="/#new" className="text-base text-gray-400 hover:text-white py-1">New Releases</a>
                                            <a href="/#top" className="text-base text-gray-400 hover:text-white py-1">Top Rated</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                {user ? (
                                    <div className="flex flex-col gap-3">
                                        <Link to="/profile" className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{user.username}</span>
                                                <span className="text-xs text-gray-400">{user.email}</span>
                                            </div>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all font-medium"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <Link to="/login" className="w-full p-3 text-center text-gray-300 hover:bg-white/5 rounded-lg font-medium transition-all" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                                        <Link to="/register" className="w-full p-3 text-center bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-all" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            <main className="min-h-[calc(100vh-80px)]">
                <Outlet />
            </main>
            <footer className="bg-black/50 backdrop-blur-md py-12 mt-20 border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 mb-4">FilmFlow</h3>
                    <p className="text-gray-600 text-sm">
                        &copy; {new Date().getFullYear()} FilmFlow. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
