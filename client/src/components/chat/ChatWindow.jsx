import { useState, useEffect, useRef } from 'react';
import { Send, Image, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import './ChatWindow.css';

export default function ChatWindow({ requestId }) {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${requestId}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to load chat messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000); // Polling backup for chat
    return () => clearInterval(interval);
  }, [requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await api.post(`/chat/${requestId}/messages`, {
        message: text,
      });
      setMessages((prev) => [...prev, res.data.data]);
      setText('');
    } catch (err) {
      toast.error('Failed to send message.');
    }
  };

  if (loading) return <div className="chat-loading"><div className="spinner" /></div>;

  return (
    <div className="chat-window card">
      <div className="card-header flex align-center gap-8">
        <MessageSquare size={20} className="text-primary" />
        <h3>In-App Discussion & Photos</h3>
      </div>

      <div className="chat-body">
        {messages.length === 0 ? (
          <div className="empty-state text-sm">
            <p>No messages yet. Send a message to discuss repair specifics or ask questions!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMe ? 'me' : 'other'}`}>
                <div className="chat-bubble">
                  <div className="chat-sender">{msg.sender?.fullName}</div>
                  <div className="chat-text">{msg.message}</div>
                  <div className="chat-time">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-footer">
        <input
          type="text"
          className="form-input"
          placeholder="Type message or updates..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-icon">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
