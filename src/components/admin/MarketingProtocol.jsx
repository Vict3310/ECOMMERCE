import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';
import { Mail, Search, Download, Trash2, Users, TrendingUp, Target, MessageCircle, X, ChevronRight, CheckSquare, Square, AlertCircle, Edit3, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const MarketingProtocol = () => {
  const { showNotification, showConfirmDialog } = useAppContext();
  
  const [contacts, setContacts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSegment, setFilterSegment] = useState('all'); // all, vip, recent, actionable
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  const [selectedContact, setSelectedContact] = useState(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campaignType, setCampaignType] = useState('email');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [contactsRes, receiptsRes] = await Promise.all([
        supabase.from('marketing_contacts').select('*').order('created_at', { ascending: false }),
        supabase.from('receipt_history').select('*')
      ]);
      
      if (contactsRes.data) setContacts(contactsRes.data);
      if (receiptsRes.data) setReceipts(receiptsRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Compute rich contact profiles combining contacts with receipt history
  const enrichedContacts = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return contacts.map(contact => {
      // Find all receipts matching phone or email
      const clientReceipts = receipts.filter(r => 
        (contact.phone && r.customer_phone === contact.phone) || 
        (contact.email && r.customer_email === contact.email) ||
        (contact.name && r.customer_name === contact.name)
      ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const totalSpent = clientReceipts.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
      const orderCount = clientReceipts.length;
      const lastOrderDate = clientReceipts.length > 0 ? new Date(clientReceipts[0].created_at) : new Date(contact.created_at);
      
      let tags = [];
      if (totalSpent > 1000000) tags.push('VIP');
      else if (totalSpent > 300000) tags.push('High Value');
      
      if (orderCount >= 3) tags.push('Frequent');
      
      if (lastOrderDate > thirtyDaysAgo) tags.push('Recent');
      
      let actionable = false;
      if (lastOrderDate < ninetyDaysAgo && totalSpent > 0) {
        tags.push('Cold Lead');
        actionable = true;
      }

      return {
        ...contact,
        clientReceipts,
        totalSpent,
        orderCount,
        lastOrderDate,
        tags,
        actionable
      };
    });
  }, [contacts, receipts]);

  // Filter and Search
  const filteredContacts = useMemo(() => {
    let result = enrichedContacts;

    if (filterSegment === 'vip') result = result.filter(c => c.tags.includes('VIP') || c.tags.includes('High Value'));
    else if (filterSegment === 'recent') result = result.filter(c => c.tags.includes('Recent'));
    else if (filterSegment === 'actionable') result = result.filter(c => c.actionable);

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.name || '').toLowerCase().includes(lower) || 
        (c.phone || '').includes(lower) || 
        (c.email || '').toLowerCase().includes(lower)
      );
    }
    
    return result;
  }, [enrichedContacts, filterSegment, searchTerm]);

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContacts.length && filteredContacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    showConfirmDialog({
      title: 'Delete Contacts',
      message: `Are you sure you want to permanently delete ${selectedIds.size} contact(s)?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        const { error } = await supabase.from('marketing_contacts').delete().in('id', Array.from(selectedIds));
        if (error) {
          showNotification(error.message, 'error');
        } else {
          setContacts(contacts.filter(c => !selectedIds.has(c.id)));
          setSelectedIds(new Set());
          showNotification('Contacts deleted successfully.', 'success');
        }
      }
    });
  };

  const handleExportCSV = () => {
    const itemsToExport = selectedIds.size > 0 
      ? filteredContacts.filter(c => selectedIds.has(c.id))
      : filteredContacts;
      
    if (itemsToExport.length === 0) return;

    const csv = ['Name,Phone,Email,Total_Spent,Orders,Tags,Added_Date']
      .concat(itemsToExport.map(c => `"${c.name || ''}","${c.phone || ''}","${c.email || ''}","${c.totalSpent}","${c.orderCount}","${c.tags.join('; ')}","${new Date(c.created_at).toLocaleDateString('en-GB')}"`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'elite_marketing_list.csv'; a.click();
    URL.revokeObjectURL(url);
    showNotification('Exported to CSV.', 'success');
  };

  const fmt = (n) => '₦' + (parseFloat(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="fade-in" style={{ position: 'relative', height: '100%', paddingBottom: '100px' }}>
      
      {/* ── HEADER & ANALYTICS ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand-blue)', marginBottom: '12px' }}>CRM & Automation</span>
          <h2 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>Marketing Protocol.</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsCampaignModalOpen(true)} style={{ padding: '12px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', borderRadius: '2px' }}>
            <Send size={14} /> NEW CAMPAIGN
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { title: 'Total Contacts', value: enrichedContacts.length, icon: Users, color: '#3b82f6' },
          { title: 'High-Value VIPs', value: enrichedContacts.filter(c => c.tags.includes('VIP')).length, icon: Target, color: '#8b5cf6' },
          { title: 'Action Needed (Cold)', value: enrichedContacts.filter(c => c.actionable).length, icon: AlertCircle, color: '#f59e0b' },
          { title: 'Est. Audience Reach', value: `${Math.round((enrichedContacts.filter(c => c.phone || c.email).length / Math.max(1, enrichedContacts.length)) * 100)}%`, icon: TrendingUp, color: '#10b981' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>{stat.title}</span>
                <Icon size={16} color={stat.color} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 900 }}>{stat.value}</span>
            </div>
          );
        })}
      </div>

      {/* ── CONTROLS & SEGMENTATION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'all', label: 'All Contacts' },
            { id: 'vip', label: 'VIPs & High Value' },
            { id: 'recent', label: 'Recent Buyers' },
            { id: 'actionable', label: 'Action Needed' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setFilterSegment(tab.id); setSelectedIds(new Set()); }}
              style={{ 
                padding: '10px 16px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', borderRadius: '2px', cursor: 'pointer',
                backgroundColor: filterSegment === tab.id ? 'var(--text-primary)' : 'transparent',
                color: filterSegment === tab.id ? 'var(--bg-primary)' : 'var(--text-primary)',
                border: filterSegment === tab.id ? 'none' : 'var(--border-thin)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '10px 12px 10px 36px', width: '250px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontSize: '12px', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* ── BULK ACTION BAR ── */}
      {selectedIds.size > 0 && (
        <div className="fade-in" style={{ padding: '12px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800 }}>{selectedIds.size} Contacts Selected</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleExportCSV} style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download size={12} /> Export Selection
            </button>
            <button onClick={handleBulkDelete} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: 'none', cursor: 'pointer', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}

      {/* ── DATA TABLE ── */}
      <div style={{ border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)', position: 'relative', minHeight: '300px' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1.5fr 1fr 1fr 40px', gap: '16px', padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: 'var(--border-thin)', position: 'sticky', top: 0, zIndex: 10 }}>
          <div onClick={toggleSelectAll} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {selectedIds.size > 0 && selectedIds.size === filteredContacts.length ? <CheckSquare size={16} /> : <Square size={16} opacity={0.5} />}
          </div>
          <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Client Profile</span>
          <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Contact</span>
          <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Lifetime Value</span>
          <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Segments</span>
          <span />
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', opacity: 0.4, fontSize: '12px' }}>Loading Protocol Data...</div>
        ) : filteredContacts.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', opacity: 0.3 }}>
            <Target size={48} style={{ marginBottom: '16px', margin: '0 auto' }} />
            <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>NO CLIENTS FOUND IN THIS SEGMENT.</p>
          </div>
        ) : (
          <div>
            {filteredContacts.map(c => (
              <div 
                key={c.id} 
                style={{ 
                  display: 'grid', gridTemplateColumns: '40px 2fr 1.5fr 1fr 1fr 40px', gap: '16px', alignItems: 'center', 
                  padding: '16px 24px', borderBottom: 'var(--border-thin)',
                  backgroundColor: selectedIds.has(c.id) ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
                className="hover-bg-secondary"
              >
                <div onClick={() => toggleSelect(c.id)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {selectedIds.has(c.id) ? <CheckSquare size={16} color="var(--brand-blue)" /> : <Square size={16} opacity={0.3} />}
                </div>
                
                <div onClick={() => setSelectedContact(c)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'grid', placeItems: 'center', fontSize: '14px', fontWeight: 900 }}>
                    {(c.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 800 }}>{c.name || 'Unknown Client'}</span>
                    <span style={{ display: 'block', fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>Last Order: {c.orderCount > 0 ? c.lastOrderDate.toLocaleDateString('en-GB') : 'Never'}</span>
                  </div>
                </div>

                <div>
                  {c.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', opacity: 0.9 }}>{c.phone}</span>
                      <a href={`https://wa.me/${c.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#25D366' }} title="WhatsApp">
                        <MessageCircle size={14} />
                      </a>
                    </div>
                  )}
                  {c.email && <span style={{ display: 'block', fontSize: '11px', opacity: 0.6 }}>{c.email}</span>}
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 900 }}>{fmt(c.totalSpent)}</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.5, marginTop: '2px' }}>{c.orderCount} Orders</span>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {c.tags.slice(0, 2).map((tag, i) => (
                    <span key={i} style={{ padding: '2px 8px', backgroundColor: tag === 'VIP' ? '#8b5cf6' : tag === 'Cold Lead' ? '#f59e0b' : 'var(--bg-secondary)', color: tag === 'VIP' || tag === 'Cold Lead' ? '#fff' : 'var(--text-primary)', border: tag === 'VIP' || tag === 'Cold Lead' ? 'none' : 'var(--border-thin)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '12px' }}>
                      {tag}
                    </span>
                  ))}
                  {c.tags.length > 2 && <span style={{ fontSize: '10px', opacity: 0.5 }}>+{c.tags.length - 2}</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedContact(c)} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }} className="hover-opacity-100">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CLIENT MODAL ── */}
      {selectedContact && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}>
          <div className="slide-left" style={{ width: '450px', maxWidth: '100vw', backgroundColor: 'var(--bg-primary)', height: '100%', overflowY: 'auto', borderLeft: 'var(--border-thin)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '32px', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 900, marginBottom: '16px' }}>
                  {(selectedContact.name || '?').charAt(0).toUpperCase()}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: 900 }}>{selectedContact.name}</h2>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {selectedContact.tags.map((tag, i) => (
                    <span key={i} style={{ padding: '4px 10px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', borderRadius: '12px' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={24} /></button>
            </div>

            <div style={{ padding: '32px', flex: 1 }}>
              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '16px' }}>Contact Info</h3>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '40px' }}>
                {selectedContact.phone && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedContact.phone}</span>
                    <a href={`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ padding: '6px 12px', backgroundColor: '#25D366', color: '#fff', fontSize: '10px', fontWeight: 800, textDecoration: 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MessageCircle size={12} /> Message
                    </a>
                  </div>
                )}
                {selectedContact.email && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700 }}>{selectedContact.email}</span>
                    <a href={`mailto:${selectedContact.email}`} style={{ padding: '6px 12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '10px', fontWeight: 800, textDecoration: 'none', borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={12} /> Email
                    </a>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '40px' }}>
                 <div style={{ padding: '20px', border: 'var(--border-thin)', borderRadius: '2px' }}>
                   <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Lifetime Value</span>
                   <span style={{ fontSize: '20px', fontWeight: 900 }}>{fmt(selectedContact.totalSpent)}</span>
                 </div>
                 <div style={{ padding: '20px', border: 'var(--border-thin)', borderRadius: '2px' }}>
                   <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: '8px' }}>Total Orders</span>
                   <span style={{ fontSize: '20px', fontWeight: 900 }}>{selectedContact.orderCount}</span>
                 </div>
              </div>

              <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, marginBottom: '16px' }}>Receipt History</h3>
              {selectedContact.clientReceipts?.length === 0 ? (
                <p style={{ fontSize: '12px', opacity: 0.5 }}>No receipts found.</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px' }}>
                  {selectedContact.clientReceipts?.map(r => (
                    <div key={r.id} style={{ padding: '16px', border: 'var(--border-thin)', borderRadius: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '12px', fontWeight: 800 }}>{r.receipt_id}</span>
                        <span style={{ display: 'block', fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>{new Date(r.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ display: 'block', fontSize: '13px', fontWeight: 900 }}>{fmt(r.total)}</span>
                        <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: r.status === 'PAID' ? '#10b981' : '#f59e0b', marginTop: '4px' }}>{r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CAMPAIGN DRAFTING MODAL ── */}
      {isCampaignModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="fade-in" style={{ width: '600px', maxWidth: '90vw', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '24px 32px', borderBottom: 'var(--border-thin)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900 }}>Draft New Campaign</h2>
              <button onClick={() => setIsCampaignModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}><X size={20} /></button>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Channel:</label>
                <select value={campaignType} onChange={e => setCampaignType(e.target.value)} style={{ padding: '8px 12px', border: 'var(--border-thin)', backgroundColor: 'transparent', fontSize: '12px', fontWeight: 700, outline: 'none' }}>
                  <option value="email">Email Blast</option>
                  <option value="whatsapp">WhatsApp Broadcast</option>
                  <option value="sms">SMS Protocol</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Target Segment:</label>
                <select style={{ width: '100%', padding: '12px 16px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', fontSize: '13px', outline: 'none' }}>
                  <option>All Contacts ({enrichedContacts.length})</option>
                  <option>VIP & High Value ({enrichedContacts.filter(c => c.tags.includes('VIP')).length})</option>
                  <option>Cold Leads ({enrichedContacts.filter(c => c.actionable).length})</option>
                </select>
              </div>

              {campaignType === 'email' && (
                <div style={{ marginBottom: '16px' }}>
                  <input type="text" placeholder="Subject Line" style={{ width: '100%', padding: '12px 16px', border: 'var(--border-thin)', backgroundColor: 'transparent', fontSize: '13px', outline: 'none' }} />
                </div>
              )}

              <div style={{ marginBottom: '32px' }}>
                <textarea rows="6" placeholder="Compose your message here... Use {Name} to insert client name." style={{ width: '100%', padding: '16px', border: 'var(--border-thin)', backgroundColor: 'transparent', fontSize: '13px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button onClick={() => setIsCampaignModalOpen(false)} style={{ padding: '12px 24px', border: 'var(--border-thin)', backgroundColor: 'transparent', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer' }}>Cancel</button>
                <button onClick={() => {
                  showNotification('Campaign module is currently in mock mode for preview.', 'info');
                  setIsCampaignModalOpen(false);
                }} style={{ padding: '12px 24px', border: 'none', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={14} /> Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarketingProtocol;
