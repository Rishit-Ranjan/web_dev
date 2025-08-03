// Profile.jsx
import React from 'react';

export default function Profile({ user }) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
                <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-bold mr-4">
                    {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{user.displayName || user.email.split('@')[0]}</h1>
                    <p className="text-gray-600">{user.email}</p>
                    <p className="text-gray-500">1,234 followers • 567 following</p>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="font-bold text-lg">245</p>
                    <p className="text-gray-600">Posts</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="font-bold text-lg">1.2K</p>
                    <p className="text-gray-600">Likes</p>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="font-bold text-lg">56</p>
                    <p className="text-gray-600">Following</p>
                </div>
            </div>
            
            <div className="border-t pt-4">
                <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                {/* User posts would go here */}
            </div>
        </div>
    );
}