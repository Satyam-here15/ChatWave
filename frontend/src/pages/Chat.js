import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const API = 'http://localhost:5000';

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

const getColor = (name) => COLORS[name?.charCodeAt(0) % COLORS.length];

const Avatar = ({ name, size = 40, online = false }) => (
    <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${getColor(name)}, ${getColor(name)}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '700', fontSize: size * 0.4, color: 'white',
            boxShadow: `0 4px 12px ${getColor(name)}40`
        }}>
            {name?.[0]?.toUpperCase()}
        </div>
        {online && (
            <div className="pulse" style={{
                position: 'absolute', bottom: 1, right: 1,
                width: size * 0.28, height: size * 0.28,
                background: '#22c55e', borderRadius: '50%',
                border: '2px solid #0f0c29'
            }} />
        )}
    </div>
);

export default function Chat() {
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typing, setTyping] = useState(false);
    const socketRef = useRef();
    const messagesEndRef = useRef();
    const inputRef = useRef();

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    useEffect(() => {
        socketRef.current = io(API);
        socketRef.current.emit('join', user._id);
        socketRef.current.on('onlineUsers', setOnlineUsers);
        socketRef.current.on('receiveMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });
        socketRef.current.on('typing', () => setTyping(true));
        socketRef.current.on('stopTyping', () => setTyping(false));
        fetchChats();
        return () => socketRef.current.disconnect();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchChats = async () => {
        const { data } = await axios.get(`${API}/api/chats`, config);
        setChats(data);
    };

    const fetchMessages = async (chatId) => {
        const { data } = await axios.get(`${API}/api/messages/${chatId}`, config);
        setMessages(data);
    };

    const selectChat = (chat) => {
        setSelectedChat(chat);
        fetchMessages(chat._id);
        setSearchResults([]);
        setSearchQuery('');
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        try {
            const { data } = await axios.post(`${API}/api/messages`, {
                chatId: selectedChat._id, content: newMessage
            }, config);
            setMessages(prev => [...prev, data]);
            const receiver = selectedChat.participants.find(p => p._id !== user._id);
            socketRef.current.emit('sendMessage', { ...data, receiverId: receiver._id });
            socketRef.current.emit('stopTyping', { receiverId: receiver._id });
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (selectedChat) {
            const receiver = selectedChat.participants.find(p => p._id !== user._id);
            socketRef.current.emit('typing', { receiverId: receiver?._id });
            setTimeout(() => socketRef.current.emit('stopTyping', { receiverId: receiver?._id }), 2000);
        }
    };

    const searchUsers = async (q) => {
        setSearchQuery(q);
        if (!q) return setSearchResults([]);
        const { data } = await axios.get(`${API}/api/users/search?q=${q}`, config);
        setSearchResults(data);
    };

    const startChat = async (userId) => {
        const { data } = await axios.post(`${API}/api/chats`, { userId }, config);
        setSelectedChat(data);
        fetchMessages(data._id);
        fetchChats();
        setSearchResults([]);
        setSearchQuery('');
    };

    const getOtherUser = (chat) => chat.participants?.find(p => p._id !== user._id);

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div style={{
            display: 'flex', height: '100vh',
            background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
            overflow: 'hidden'
        }}>
            {/* Sidebar */}
            <div style={{
                width: '340px', flexShrink: 0,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    background: 'rgba(255,255,255,0.05)',
                    borderBottom: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Avatar name={user.username} size={42} online={true} />
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '15px' }}>{user.username}</div>
                                <div style={{ color: '#22c55e', fontSize: '12px' }}>● Online</div>
                            </div>
                        </div>
                        <button onClick={logout} style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            color: '#fca5a5', padding: '6px 12px',
                            borderRadius: '8px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600'
                        }}>
                            Logout
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px' }}>🔍</span>
                        <input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={e => searchUsers(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 12px 10px 36px',
                                background: 'rgba(255,255,255,0.07)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px', color: 'white',
                                fontSize: '14px', outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div style={{
                        background: 'rgba(124,58,237,0.1)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <div style={{ padding: '8px 16px', color: '#a78bfa', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Search Results
                        </div>
                        {searchResults.map(u => (
                            <div key={u._id} onClick={() => startChat(u._id)}
                                style={{
                                    padding: '10px 16px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Avatar name={u.username} size={36} online={onlineUsers.includes(u._id)} />
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{u.username}</div>
                                    <div style={{ color: '#64748b', fontSize: '12px' }}>{u.email}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Chats Label */}
                <div style={{ padding: '12px 16px 4px', color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Messages
                </div>

                {/* Chat List */}
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {chats.length === 0 && (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>💬</div>
                            <div style={{ fontSize: '14px' }}>No chats yet</div>
                            <div style={{ fontSize: '12px', marginTop: '4px' }}>Search for users to start chatting</div>
                        </div>
                    )}
                    {chats.map(chat => {
                        const other = getOtherUser(chat);
                        const isOnline = onlineUsers.includes(other?._id);
                        const isSelected = selectedChat?._id === chat._id;
                        return (
                            <div key={chat._id} onClick={() => selectChat(chat)}
                                style={{
                                    padding: '12px 16px', cursor: 'pointer',
                                    background: isSelected ? 'rgba(124,58,237,0.15)' : 'transparent',
                                    borderLeft: isSelected ? '3px solid #7c3aed' : '3px solid transparent',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <Avatar name={other?.username} size={46} online={isOnline} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '2px' }}>
                                        {other?.username}
                                    </div>
                                    <div style={{ color: isOnline ? '#22c55e' : '#475569', fontSize: '12px' }}>
                                        {isOnline ? '● Online' : '○ Offline'}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Chat Area */}
            {selectedChat ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                        <Avatar
                            name={getOtherUser(selectedChat)?.username}
                            size={44}
                            online={onlineUsers.includes(getOtherUser(selectedChat)?._id)}
                        />
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '16px' }}>
                                {getOtherUser(selectedChat)?.username}
                            </div>
                            <div style={{ fontSize: '13px', color: typing ? '#a78bfa' : onlineUsers.includes(getOtherUser(selectedChat)?._id) ? '#22c55e' : '#475569' }}>
                                {typing ? '✏️ typing...' : onlineUsers.includes(getOtherUser(selectedChat)?._id) ? '● Online' : '○ Offline'}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '24px',
                        display: 'flex', flexDirection: 'column', gap: '4px'
                    }}>
                        {messages.map((msg, i) => {
                            const isMe = msg.sender._id === user._id;
                            const showAvatar = !isMe && (i === 0 || messages[i-1]?.sender._id !== msg.sender._id);
                            return (
                                <div key={msg._id} className="message-animate"
                                    style={{
                                        display: 'flex',
                                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                                        alignItems: 'flex-end', gap: '8px',
                                        marginBottom: '4px'
                                    }}
                                >
                                    {!isMe && (
                                        <div style={{ width: '28px', flexShrink: 0 }}>
                                            {showAvatar && <Avatar name={msg.sender.username} size={28} />}
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '65%',
                                        padding: '10px 16px',
                                        borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        background: isMe
                                            ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                                            : 'rgba(255,255,255,0.08)',
                                        backdropFilter: 'blur(10px)',
                                        border: isMe ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                        boxShadow: isMe ? '0 4px 20px rgba(124,58,237,0.3)' : 'none'
                                    }}>
                                        <div style={{ fontSize: '15px', lineHeight: '1.5', wordBreak: 'break-word' }}>
                                            {msg.content}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: isMe ? 'rgba(255,255,255,0.6)' : '#475569',
                                            marginTop: '4px',
                                            textAlign: 'right'
                                        }}>
                                            {formatTime(msg.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div style={{
                        padding: '16px 24px',
                        background: 'rgba(255,255,255,0.03)',
                        backdropFilter: 'blur(20px)',
                        borderTop: '1px solid rgba(255,255,255,0.08)'
                    }}>
                        <form onSubmit={sendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <input
                                ref={inputRef}
                                value={newMessage}
                                onChange={handleTyping}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '14px 20px',
                                    background: 'rgba(255,255,255,0.07)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '24px', color: 'white',
                                    fontSize: '15px', outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                            />
                            <button type="submit" style={{
                                width: '50px', height: '50px',
                                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                                border: 'none', borderRadius: '50%',
                                color: 'white', fontSize: '20px',
                                cursor: 'pointer', flexShrink: 0,
                                boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'transform 0.2s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                ➤
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                /* Welcome Screen */
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexDirection: 'column', gap: '16px'
                }}>
                    <div style={{
                        width: '120px', height: '120px',
                        background: 'linear-gradient(135deg, #7c3aed20, #06b6d420)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '48px',
                        border: '2px solid rgba(124,58,237,0.2)'
                    }}>
                        💬
                    </div>
                    <h2 style={{
                        fontSize: '24px', fontWeight: '800',
                        background: 'linear-gradient(135deg, #a78bfa, #38bdf8)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Welcome to ChatWave
                    </h2>
                    <p style={{ color: '#475569', fontSize: '15px' }}>
                        Search for a user and start an amazing conversation
                    </p>
                </div>
            )}
        </div>
    );
}
