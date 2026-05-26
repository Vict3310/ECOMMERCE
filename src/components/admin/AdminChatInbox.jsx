import React, { useState, useEffect, useRef } from 'react';
import { User, Send, ChevronRight, MessageSquareOff } from 'lucide-react';
import { supabase } from '../../supabase';

const AdminChatInbox = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchSessions = async () => {
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: false });
      if (data) {
        const sessionsMap = {};
        data.forEach(msg => {
          if (!sessionsMap[msg.chat_id]) {
            sessionsMap[msg.chat_id] = {
              id: msg.chat_id,
              meta: {
                lastMessage: msg.text,
                lastTimestamp: new Date(msg.created_at).getTime(),
                senderEmail: msg.sender_role === 'user' ? msg.sender : 'Client',
                unread: msg.sender_role === 'user' // Admin hasn't replied yet
              }
            };
          }
        });
        setSessions(Object.values(sessionsMap).sort((a, b) => b.meta.lastTimestamp - a.meta.lastTimestamp));
      }
    };
    fetchSessions();
    const channel = supabase.channel('chat_inbox')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages' }, fetchSessions)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  // 2. Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('chat_id', selectedSession.id).order('created_at', { ascending: true });
      if (data) {
        setMessages(data.map(m => ({ id: m.id, text: m.text, senderRole: m.sender_role })));
      }
    };
    fetchMessages();
    const channel = supabase.channel('chat_messages_session')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `chat_id=eq.${selectedSession.id}` }, fetchMessages)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedSession]);

  useEffect(() => {
    if (selectedSession) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedSession]);

  const displayedMessages = selectedSession ? messages : [];

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !selectedSession) return;

    try {
      await supabase.from('chat_messages').insert({
        chat_id: selectedSession.id,
        text: reply,
        sender: 'Admin',
        sender_role: 'admin'
      });
      setReply('');
    } catch (err) {
      console.error("Reply failed", err);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', height: '600px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
       {/* Sidebar: Session List */}
       <div style={{ borderRight: 'var(--border-thin)', overflowY: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
          <div style={{ padding: '24px', borderBottom: 'var(--border-thin)' }}>
             <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', opacity: 0.5 }}>ACTIVE SESSIONS</h3>
          </div>
          {sessions.length === 0 && (
             <div style={{ padding: '48px 24px', textAlign: 'center', opacity: 0.3 }}>
                <MessageSquareOff size={24} style={{ margin: '0 auto 16px' }} />
                <p style={{ fontSize: '10px', fontWeight: 800 }}>NO ACTIVE CHATS</p>
             </div>
          )}
          {sessions.map(session => (
             <div 
               key={session.id}
               onClick={() => setSelectedSession(session)}
               style={{ 
                 padding: '24px', borderBottom: 'var(--border-thin)', cursor: 'pointer',
                 backgroundColor: selectedSession?.id === session.id ? 'var(--bg-primary)' : 'transparent',
                 transition: 'background 0.3s'
               }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                   <span style={{ fontSize: '11px', fontWeight: 800, color: session.meta.unread ? 'var(--brand-blue)' : 'inherit' }}>
                      {session.meta.senderEmail || 'Guest User'}
                      {session.meta.unread && <span style={{ marginLeft: '8px', color: 'var(--brand-blue)' }}>●</span>}
                   </span>
                   <span style={{ fontSize: '9px', opacity: 0.4 }}>{session.meta.lastTimestamp ? new Date(session.meta.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
                <p style={{ fontSize: '12px', opacity: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.meta.lastMessage || 'Starting...'}</p>
             </div>
          ))}
       </div>

       {/* Main: Chat View */}
       <div style={{ display: 'flex', flexDirection: 'column' }}>
          {!selectedSession ? (
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2 }}>
                <User size={64} style={{ marginBottom: '24px' }} />
                <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em' }}>SELECT A CLIENT TO RESPOND</p>
             </div>
          ) : (
             <>
                {/* Header */}
                <div style={{ padding: '24px', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h3 style={{ fontSize: '14px', fontWeight: 800 }}>{selectedSession.meta.senderEmail || 'Guest'}</h3>
                   <span style={{ fontSize: '9px', opacity: 0.5, fontWeight: 800 }}>ID: {selectedSession.id}</span>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, padding: '32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   {displayedMessages.map(msg => (
                     <div key={msg.id} style={{ 
                       alignSelf: msg.senderRole === 'admin' ? 'flex-end' : 'flex-start',
                       maxWidth: '70%',
                       padding: '16px',
                       borderRadius: '2px',
                       backgroundColor: msg.senderRole === 'admin' ? 'var(--brand-blue)' : 'var(--bg-secondary)',
                       color: msg.senderRole === 'admin' ? '#fff' : 'var(--text-primary)',
                       fontSize: '13px',
                       lineHeight: 1.6
                     }}>
                        {msg.text}
                     </div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                {/* Reply Bar */}
                <form onSubmit={handleSendReply} style={{ padding: '24px', borderTop: 'var(--border-thin)', display: 'flex', gap: '16px' }}>
                   <input 
                     value={reply}
                     onChange={(e) => setReply(e.target.value)}
                     placeholder="Type official response..."
                     style={{ flex: 1, backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', padding: '16px', borderRadius: '2px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }}
                   />
                   <button type="submit" style={{ padding: '0 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: '2px', fontWeight: 800, cursor: 'pointer' }}>
                      <Send size={20} />
                   </button>
                </form>
             </>
          )}
       </div>
    </div>
  );
};

export default AdminChatInbox;
