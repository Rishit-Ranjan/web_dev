// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ user }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                        Welcome to <span className="text-indigo-600 dark:text-indigo-400">ConnectSphere</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
                        The modern way to connect, share, and discover with your community
                    </p>
                    
                    {user ? (
                        <div className="space-y-6">
                            <p className="text-xl text-gray-700 dark:text-gray-200">
                                Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user.email}</span>!
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Link 
                                    to="/feed" 
                                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    Go to Your Feed
                                </Link>
                                <Link 
                                    to="/profile" 
                                    className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-semibold rounded-xl shadow-lg text-indigo-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-indigo-400 dark:border-gray-700 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center space-x-6">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                            >
                                Get Started
                            </Link>
                            <Link 
                                to="/signup" 
                                className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-semibold rounded-xl shadow-lg text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                            >
                                Create Account
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ... rest of your Home component ... */}
            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Why Choose ConnectSphere?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Designed to bring communities together with powerful features
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    
                    {/* Feature 1 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            Community Connection
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Build meaningful connections with your peers, colleagues, or classmates in a dedicated space.
                        </p>
                    </div>
                    
                    {/* Feature 2 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            Real-time Announcements
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Get instant updates on important events, deadlines, and news from your organization.
                        </p>
                    </div>
                    
                    {/* Feature 3 */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-transparent hover:border-indigo-100 dark:hover:border-gray-700">
                        <div className="flex justify-center mb-6">
                            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            Resource Sharing
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-center">
                            Easily share and access course materials, schedules, and study resources with your peers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Testimonial Section */}
            <div className="bg-indigo-600 dark:bg-indigo-800 py-16">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <blockquote className="text-white">
                        <p className="text-xl md:text-2xl italic mb-6">
                            "ConnectSphere transformed how our student community interacts. Everything from event planning to resource sharing became seamless."
                        </p>
                        <footer className="text-indigo-100 dark:text-indigo-200 font-medium">
                            — Sarah Johnson, University Administrator
                        </footer>
                    </blockquote>
                </div>
            </div>
            {/* Footer Section */}
        </div>
    );
}