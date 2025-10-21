// frontend/src/pages/chat/ChatPage.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../dashboard/style-admin.css';
import './chat-style.css';

const ChatPage = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const pollingInterval = useRef(null);

  const currentUserId = parseInt(localStorage.getItem('userId'));
  const userName = localStorage.getItem('userName') || 'User';

  useEffect(() => {
    fetchContacts();
    fetchUnreadCount();
    
    // Polling untuk update otomatis
    pollingInterval.current = setInterval(() => {
      if (selectedContact) {
        fetchMessages(selectedContact.id);
      }
      fetchContacts();
      fetchUnreadCount();
    }, 3000); // Update setiap 3 detik

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [selectedContact]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chats/contacts');
      setContacts(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat kontak.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await api.get('/chats/users');
      setAllUsers(res.data);
    } catch (err) {
      console.error('Gagal memuat users:', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/chats/conversation/${userId}`);
      setMessages(res.data);
      // Mark as read
      await api.put(`/chats/read/${userId}`);
      fetchContacts();
      fetchUnreadCount();
    } catch (err) {
      console.error('Gagal memuat pesan:', err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/chats/unread');
      setUnreadCount(res.data.unread_count);
    } catch (err) {
      console.error('Gagal memuat unread count:', err);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    fetchMessages(contact.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    try {
      await api.post('/chats/send', {
        receiver_id: selectedContact.id,
        message: newMessage
      });
      setNewMessage('');
      fetchMessages(selectedContact.id);
      fetchContacts();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim pesan.');
    }
  };

  const handleDeleteMessage = async (chatId) => {
    if (!window.confirm('Yakin ingin menghapus pesan ini?')) return;
    try {
      await api.delete(`/chats/${chatId}`);
      fetchMessages(selectedContact.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus pesan.');
    }
  };

  const handleStartNewChat = async (user) => {
    setSelectedContact(user);
    setShowNewChatModal(false);
    fetchMessages(user.id);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.clear();
      navigate('/login');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge bg-danger',
      staf: 'badge bg-primary',
      anggota: 'badge bg-success'
    };
    return badges[role] || 'badge bg-secondary';
  };

  return (
    <div className="admin-wrapper">
      {/* HEADER */}
      <header className="admin-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <div className="header-left">
              <h2 className="mb-0">
                <i className="bi bi-chat-dots me-2"></i>
                Chat Messaging
                {unreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{unreadCount}</span>
                )}
              </h2>
              <p className="text-muted mb-0 small">Komunitas EE Lokal Soe</p>
            </div>
            <div className="header-right d-flex align-items-center gap-3">
              <button onClick={() => navigate(-1)} className="btn btn-outline-light">
                <i className="bi bi-arrow-left me-2"></i>
                Kembali
              </button>
              <span className="text-white fw-semibold d-none d-md-inline">
                <i className="bi bi-person-circle me-2"></i>
                {userName}
              </span>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                <i className="bi bi-box-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="chat-content" style={{ marginTop: '88px', height: 'calc(100vh - 88px)' }}>
        <div className="container-fluid h-100">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <div className="chat-container">
            {/* SIDEBAR - CONTACTS LIST */}
            <div className="chat-sidebar">
              <div className="sidebar-header">
                <h6 className="mb-0">Pesan</h6>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    fetchAllUsers();
                    setShowNewChatModal(true);
                  }}
                >
                  <i className="bi bi-plus-circle"></i>
                </button>
              </div>

              <div className="contacts-list">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary"></div>
                  </div>
                ) : contacts.length === 0 ? (
                  <div className="empty-state-small">
                    <i className="bi bi-chat-dots"></i>
                    <p className="small">Belum ada percakapan</p>
                  </div>
                ) : (
                  contacts.map(contact => (
                    <div 
                      key={contact.id}
                      className={`contact-item ${selectedContact?.id === contact.id ? 'active' : ''}`}
                      onClick={() => handleSelectContact(contact)}
                    >
                      <div className="contact-avatar">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="contact-info">
                        <div className="d-flex justify-content-between align-items-start">
                          <span className="contact-name">{contact.name}</span>
                          {contact.unread_count > 0 && (
                            <span className="badge bg-danger rounded-pill">{contact.unread_count}</span>
                          )}
                        </div>
                        <small className="text-muted text-truncate d-block">
                          {contact.last_message || 'Tidak ada pesan'}
                        </small>
                        <span className={getRoleBadge(contact.role) + ' badge-small'}>
                          {contact.role}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="chat-main">
              {selectedContact ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-header">
                    <div className="d-flex align-items-center">
                      <div className="contact-avatar me-3">
                        {selectedContact.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h6 className="mb-0">{selectedContact.name}</h6>
                        <small className="text-muted">{selectedContact.email}</small>
                      </div>
                    </div>
                    <span className={getRoleBadge(selectedContact.role)}>
                      {selectedContact.role.toUpperCase()}
                    </span>
                  </div>

                  {/* Messages Area */}
                  <div className="messages-container">
                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`message ${msg.sender_id === currentUserId ? 'message-sent' : 'message-received'}`}
                      >
                        <div className="message-bubble">
                          <p className="message-text">{msg.message}</p>
                          <div className="d-flex justify-content-between align-items-center mt-1">
                            <small className="message-time">
                              {new Date(msg.created_at).toLocaleTimeString('id-ID', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                            {msg.sender_id === currentUserId && (
                              <button 
                                className="btn btn-link btn-sm text-danger p-0"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Hapus pesan"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="chat-input-area">
                    <form onSubmit={handleSendMessage} className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={!newMessage.trim()}
                      >
                        <i className="bi bi-send-fill"></i>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="chat-empty-state">
                  <i className="bi bi-chat-left-text"></i>
                  <h5>Pilih kontak untuk memulai percakapan</h5>
                  <p className="text-muted">Pesan akan muncul di sini</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* NEW CHAT MODAL */}
      {showNewChatModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  Chat Baru
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowNewChatModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="list-group" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {allUsers.map(user => (
                    <button
                      key={user.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      onClick={() => handleStartNewChat(user)}
                    >
                      <div>
                        <div className="fw-semibold">{user.name}</div>
                        <small className="text-muted">{user.email}</small>
                      </div>
                      <span className={getRoleBadge(user.role)}>
                        {user.role.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;