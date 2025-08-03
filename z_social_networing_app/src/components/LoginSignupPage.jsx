import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm.jsx';
import SignupForm from './SignupForm.jsx';

export default function LoginSignupPage({ isLogin }) {
    const navigate = useNavigate();

    const toggleForm = () => {
        navigate(isLogin ? '/signup' : '/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center font-sans bg-gray-100 dark:bg-gray-900" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2070&auto=format&fit=crop')" }}>
            <div className="w-full max-w-md p-8 space-y-8 bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-2xl" style={{ backdropFilter: 'blur(10px)' }}>
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ConnectSphere</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Connect, share, and discover.</p>
                </div>

                {isLogin ? <LoginForm /> : <SignupForm toggleForm={toggleForm} />}

                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {isLogin ? "Don't have an account?" : 'Already have an account?'}
                        <button onClick={toggleForm} className="ml-1 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}