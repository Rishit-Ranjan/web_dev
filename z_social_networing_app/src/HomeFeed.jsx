// HomeFeed.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from './firebase-config.jsx';
import { collection, query, where, getDocs, addDoc, onSnapshot } from 'firebase/firestore';

export default function HomeFeed({ user }) {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    //const [users, setUsers] = useState([]);
    const [trendingTopics, setTrendingTopics] = useState([]);
    const [suggestedFriends, setSuggestedFriends] = useState([]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const q = query(collection(db, 'posts'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData = [];
            querySnapshot.forEach((doc) => {
                postsData.push({ id: doc.id, ...doc.data() });
            });
            setPosts(postsData.sort((a, b) => b.timestamp - a.timestamp));
        });

        const fetchUsers = async () => {
            const q = query(collection(db, 'users'), where('uid', '!=', user.uid));
            const querySnapshot = await getDocs(q);
            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push(doc.data());
            });
            //          setUsers(usersData);
                        setSuggestedFriends(usersData.slice(0, 5));
        };

        fetchUsers();

        return () => unsubscribe();
    }, [user, navigate]);

    // ... rest of your HomeFeed component ...
    // Mock trending topics
    useEffect(() => {
        setTrendingTopics([
            "Friends/Innovations",
            "Friends/Institute/Living",
            "E.W.parts",
            "Flagshakes",
            "R.S.parts",
            "Miterfulness",
            "C.W.parts",
            "F.Fluent/Fuesday",
            "Y.K.parts"
        ]);
    }, []);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        try {
            await addDoc(collection(db, 'posts'), {
                content: newPost,
                author: user.displayName || user.email,
                authorId: user.uid,
                timestamp: new Date(),
                likes: 0,
                comments: []
            });
            setNewPost('');
        } catch (error) {
            console.error("Error adding post: ", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Sidebar - Navigation */}
                    <div className="w-full md:w-1/4 bg-white rounded-lg shadow p-4 h-fit">
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-gray-800">ConnectSphere</h1>
                            <div className="flex items-center mt-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                    {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                                </div>
                                <div className="ml-3">
                                    <p className="font-semibold">{user.displayName || user.email.split('@')[0]}</p>
                                    <p className="text-sm text-gray-500">{Math.floor(Math.random() * 1000)} followers</p>
                                </div>
                            </div>
                        </div>

                        <nav className="space-y-2">
                            <Link to="/home" className="block py-2 px-3 rounded hover:bg-gray-100 font-medium">Home</Link>
                            <Link to="/friends" className="block py-2 px-3 rounded hover:bg-gray-100">Friends</Link>
                            <Link to="/messages" className="block py-2 px-3 rounded hover:bg-gray-100">Messages</Link>
                            <Link to="/notifications" className="block py-2 px-3 rounded hover:bg-gray-100">Notifications</Link>
                            <Link to="/photos" className="block py-2 px-3 rounded hover:bg-gray-100">Photos</Link>
                            <Link to="/videos" className="block py-2 px-3 rounded hover:bg-gray-100">Videos</Link>
                            <Link to="/settings" className="block py-2 px-3 rounded hover:bg-gray-100">Settings</Link>
                        </nav>
                    </div>

                    {/* Main Content - Feed */}
                    <div className="w-full md:w-2/4 space-y-4">
                        {/* Create Post */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                                    {user.displayName ? user.displayName.charAt(0) : user.email.charAt(0)}
                                </div>
                                <input
                                    type="text"
                                    placeholder="What's on your mind..."
                                    className="flex-1 border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    onClick={() => document.getElementById('post-options').classList.remove('hidden')}
                                />
                            </div>
                            <div id="post-options" className="flex justify-between border-t pt-3">
                                <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                                    <span className="mr-2">📷</span> Photo
                                </button>
                                <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                                    <span className="mr-2">🎥</span> Video
                                </button>
                                <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                                    <span className="mr-2">😊</span> Feeling
                                </button>
                                <button className="flex items-center text-gray-600 hover:bg-gray-100 px-3 py-1 rounded">
                                    <span className="mr-2">🎮</span> Game
                                </button>
                            </div>
                            <button
                                onClick={handlePostSubmit}
                                className="mt-3 w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
                            >
                                Post
                            </button>
                        </div>

                        {/* Posts Feed */}
                        {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center mb-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-3">
                                        {post.author.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{post.author}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(post.timestamp?.toDate()).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-4">{post.content}</p>
                                <div className="flex justify-between text-gray-500 border-t pt-3">
                                    <button className="flex items-center">
                                        <span className="mr-1">👍</span> Like ({post.likes || 0})
                                    </button>
                                    <button className="flex items-center">
                                        <span className="mr-1">💬</span> Comment
                                    </button>
                                    <button className="flex items-center">
                                        <span className="mr-1">↗️</span> Share
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar - Trending and Suggestions */}
                    <div className="w-full md:w-1/4 space-y-4">
                        {/* Search */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <input
                                type="text"
                                placeholder="Search for friends, poets, hearings..."
                                className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Trending Topics */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold text-lg mb-3">Trending Topics</h3>
                            <ul className="space-y-2">
                                {trendingTopics.map((topic, index) => (
                                    <li key={index} className="text-indigo-600 hover:underline cursor-pointer">
                                        #{topic}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* People You May Know */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold text-lg mb-3">People You May Know</h3>
                            <div className="space-y-3">
                                {suggestedFriends.map((friend, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold mr-2">
                                                {friend.displayName?.charAt(0) || friend.email.charAt(0)}
                                            </div>
                                            <span>{friend.displayName || friend.email.split('@')[0]}</span>
                                        </div>
                                        <button className="text-indigo-600 text-sm font-medium">Add</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
