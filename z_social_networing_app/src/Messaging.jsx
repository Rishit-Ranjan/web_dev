// Messages.jsx
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase-config';

export default function Messages({ user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        // In a real app, you would fetch conversations or messages for the current user
        const q = query(collection(db, 'messages'), 
            where('participants', 'array-contains', user.uid));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const messagesData = [];
            snapshot.forEach(doc => {
                messagesData.push({ id: doc.id, ...doc.data() });
            });
            setMessages(messagesData);
        });
        
        return () => unsubscribe();
    }, [user]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedUser) return;
        
        await addDoc(collection(db, 'messages'), {
            content: newMessage,
            sender: user.uid,
            recipient: selectedUser,
            timestamp: serverTimestamp(),
            participants: [user.uid, selectedUser],
            read: false
        });
        
        setNewMessage('');
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            
            <div className="flex">
                {/* Conversation list */}
                <div className="w-1/3 border-r pr-4">
                    {messages.map(msg => (
                        <div 
                            key={msg.id} 
                            className={`p-3 rounded-lg cursor-pointer ${selectedUser === msg.sender ? 'bg-gray-100' : ''}`}
                            onClick={() => setSelectedUser(msg.sender === user.uid ? msg.recipient : msg.sender)}
                        >
                            <p className="font-medium">{msg.sender === user.uid ? 'You' : 'Friend'}</p>
                            <p className="text-sm text-gray-600 truncate">{msg.content}</p>
                        </div>
                    ))}
                </div>
                
                {/* Message area */}
                <div className="w-2/3 pl-4">
                    {selectedUser ? (
                        <>
                            <div className="h-64 overflow-y-auto mb-4">
                                {messages
                                    .filter(msg => 
                                        msg.participants.includes(user.uid) && 
                                        msg.participants.includes(selectedUser))
                                    .map(msg => (
                                        <div 
                                            key={msg.id} 
                                            className={`mb-2 p-2 rounded-lg ${msg.sender === user.uid ? 'bg-indigo-100 ml-auto' : 'bg-gray-100 mr-auto'}`}
                                            style={{ maxWidth: '70%' }}
                                        >
                                            <p>{msg.content}</p>
                                            <p className="text-xs text-gray-500 text-right">
                                                {msg.timestamp?.toDate().toLocaleTimeString()}
                                            </p>
                                        </div>
                                    ))
                                }
                            </div>
                            
                            <div className="flex">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded-l-lg p-2"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="bg-indigo-600 text-white px-4 rounded-r-lg"
                                >
                                    Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Select a conversation to start chatting
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}