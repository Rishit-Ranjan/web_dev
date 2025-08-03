// AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from './firebase-config';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const postsSnapshot = await getDocs(collection(db, 'posts'));
            
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setPosts(postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchData();
    }, []);

    const deleteUser = async (userId) => {
        // In a real app, you would also delete user from Firebase Auth
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
    };

    const deletePost = async (postId) => {
        await deleteDoc(doc(db, 'posts', postId));
        setPosts(posts.filter(post => post.id !== postId));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Users ({users.length})</h2>
                    <div className="space-y-3">
                        {users.map(user => (
                            <div key={user.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{user.displayName || user.email}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                                <button 
                                    onClick={() => deleteUser(user.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-4">
                    <h2 className="text-xl font-bold mb-4">Posts ({posts.length})</h2>
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className="border-b pb-2">
                                <div className="flex justify-between">
                                    <p className="font-medium">{post.author}</p>
                                    <button 
                                        onClick={() => deletePost(post.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 truncate">{post.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}