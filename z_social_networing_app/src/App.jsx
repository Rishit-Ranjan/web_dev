// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { auth } from './firebase-config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './Home';
import HomeFeed from './HomeFeed';  // Add this import
import LoginSignupPage from './components/LoginSignupPage';
import Profile from './Profile';
import AdminDashboard from './AdminDashboard';
import Messages from './Messaging';

export default function App() {
    const [isDarkMode] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [isDarkMode]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <Router>
            <nav className="bg-white dark:bg-gray-800 shadow-lg">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
                                ConnectSphere
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <Link to="/feed" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        HomeFeed
                                    </Link>
                                    <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        Profile
                                    </Link>
                                    <button 
                                        onClick={handleLogout}
                                        className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        Login
                                    </Link>
                                    <Link to="/signup" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home user={user} />} />
                <Route path="/feed" element={user ? <HomeFeed user={user} /> : <Navigate to="/login" />} />
                <Route path="/login" element={user ? <Navigate to="/feed" /> : <LoginSignupPage isLogin={true} />} />
                <Route path="/signup" element={user ? <Navigate to="/feed" /> : <LoginSignupPage isLogin={false} />} />
                <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/login" />} />
                
            </Routes>
        </Router>
    );
}