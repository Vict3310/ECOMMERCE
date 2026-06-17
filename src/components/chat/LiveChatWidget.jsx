import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { supabase } from '../../supabase';
import { useAppContext } from '../../context/AppContext';

const LiveChatWidget = () => {
  const { user } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('ifeco-chat-session') || '');

  const chatEndRef = useRef(null);

  // Sync to actual UID if logged in
  useEffect(() => {
    if (user) {
      setSessionId(user.id);
      return;
    }

    if (!sessionId) {
      const saved = localStorage.getItem('ifeco-chat-session');
      if (saved) {
        setSessionId(saved);
        return;
      }
      const newId = `guest-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('ifeco-chat-session', newId);
      setSessionId(newId);
    }
  }, [user, sessionId]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', sessionId).order('created_at', { ascending: true });
      if (data) {
        setChatHistory(data.map(m => ({ id: m.id, text: m.text, senderRole: m.sender_role })));
      }
    };
    fetchMessages();
    const channel = supabase.channel('live_chat_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${sessionId}` }, fetchMessages)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [isOpen, sessionId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await supabase.from('chat_messages').insert({
        chat_id: sessionId,
        text: message,
        sender: user ? user.email : 'Guest',
        sender_role: 'user'
      });
      setMessage('');
    } catch (err) {
      console.error("Chat push failed", err);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '48px', left: '48px', zIndex: 10000 }}>
       {/* Bubble */}
       {!isOpen && (
         <button 
           onClick={() => setIsOpen(true)}
           className="hover-scale"
           style={{ 
             width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
             display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer'
           }}
         >
           <MessageSquare size={24} />
         </button>
       )}

       {/* Chat Window */}
       {isOpen && (
         <div className="fade-in" style={{ 
           width: '360px', height: '500px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '16px',
           display: 'flex', flexDirection: 'column', boxShadow: '0 40px 100px rgba(0,0,0,0.3)', overflow: 'hidden'
         }}>
            {/* Header */}
            <div style={{ padding: '24px', borderBottom: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00D1FF' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em' }}>ELITE SUPPORT LIVE</h3>
               </div>
               <button onClick={() => setIsOpen(false)} style={{ opacity: 0.3, cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
               {chatHistory.length === 0 && (
                 <div style={{ textAlign: 'center', marginTop: '100px', opacity: 0.3 }}>
                    <User size={32} style={{ margin: '0 auto 16px' }} />
                    <p style={{ fontSize: '11px', fontWeight: 800 }}>START A CONVERSATION...</p>
                 </div>
               )}
               {chatHistory.map(msg => (
                 <div key={msg.id} style={{ 
                   alignSelf: msg.senderRole === 'admin' ? 'flex-start' : 'flex-end',
                   maxWidth: '80%',
                   padding: '12px 16px',
                   borderRadius: msg.senderRole === 'admin' ? '16px 16px 16px 2px' : '16px 16px 2px 16px',
                   backgroundColor: msg.senderRole === 'admin' ? 'var(--bg-secondary)' : 'var(--brand-blue)',
                   color: msg.senderRole === 'admin' ? 'var(--text-primary)' : '#fff',
                   fontSize: '13px',
                   border: msg.senderRole === 'admin' ? 'var(--border-thin)' : 'none'
                 }}>
                   {msg.text}
                 </div>
               ))}
               <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} style={{ padding: '20px', borderTop: 'var(--border-thin)', display: 'flex', gap: '12px' }}>
               <input 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Type your message..."
                 style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '13px', outline: 'none' }}
               />
               <button type="submit" style={{ opacity: message.trim() ? 1 : 0.3, color: 'var(--brand-blue)', cursor: 'pointer', transition: 'opacity 0.3s' }}>
                 <Send size={20} />
               </button>
            </form>
         </div>
       )}
    </div>
  );
};

export default LiveChatWidget;
