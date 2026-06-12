import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import { Settings, Tool, Plus, Edit3, Trash2, CheckCircle, Clock, AlertTriangle, Phone, FileText } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const STATUS_OPTIONS = ['Diagnosing', 'Awaiting Parts', 'Repairing', 'Ready', 'Completed'];

const RepairManager = () => {
  const { showNotification, showConfirmDialog, user } = useAppContext();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    device_model: '',
    issue_description: '',
    status: 'Diagnosing',
    estimated_cost: '',
    actual_cost: '',
    deposit_paid: '',
    notes: ''
  });

  const fetchTickets = async () => {
    setLoading(true);
    const { data } = await supabase.from('repair_tickets').select('*').order('created_at', { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenForm = (ticket = null) => {
    if (ticket) {
      setFormData({
        customer_name: ticket.customer_name || '',
        customer_phone: ticket.customer_phone || '',
        device_model: ticket.device_model || '',
        issue_description: ticket.issue_description || '',
        status: ticket.status || 'Diagnosing',
        estimated_cost: ticket.estimated_cost || '',
        actual_cost: ticket.actual_cost || '',
        deposit_paid: ticket.deposit_paid || '',
        notes: ticket.notes || ''
      });
      setSelectedTicket(ticket);
    } else {
      setFormData({
        customer_name: '', customer_phone: '', device_model: '', issue_description: '',
        status: 'Diagnosing', estimated_cost: '', actual_cost: '', deposit_paid: '', notes: ''
      });
      setSelectedTicket(null);
    }
    setIsFormOpen(true);
  };

  const handleSaveTicket = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.device_model || !formData.issue_description) {
      showNotification('Name, device, and issue are required.', 'error');
      return;
    }

    const payload = {
      customer_name: formData.customer_name,
      customer_phone: formData.customer_phone,
      device_model: formData.device_model,
      issue_description: formData.issue_description,
      status: formData.status,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : null,
      actual_cost: formData.actual_cost ? parseFloat(formData.actual_cost) : null,
      deposit_paid: formData.deposit_paid ? parseFloat(formData.deposit_paid) : 0,
      notes: formData.notes,
      updated_at: new Date().toISOString()
    };

    let error;
    if (selectedTicket) {
      const res = await supabase.from('repair_tickets').update(payload).eq('id', selectedTicket.id);
      error = res.error;
    } else {
      const tracking_id = 'REP-' + Math.floor(100000 + Math.random() * 900000);
      const res = await supabase.from('repair_tickets').insert({
        ...payload,
        tracking_id,
        created_by: user?.id
      });
      error = res.error;
    }

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification(selectedTicket ? 'Ticket updated' : 'Ticket created', 'success');
      setIsFormOpen(false);
      fetchTickets();
    }
  };

  const handleDeleteTicket = (id) => {
    showConfirmDialog({
      title: 'Delete Ticket',
      message: 'Are you sure you want to delete this repair ticket?',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        const { error } = await supabase.from('repair_tickets').delete().eq('id', id);
        if (error) showNotification(error.message, 'error');
        else {
          showNotification('Ticket removed', 'success');
          fetchTickets();
        }
      }
    });
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('repair_tickets').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) showNotification(error.message, 'error');
    else {
      showNotification('Status updated', 'success');
      fetchTickets();
    }
  };

  const fmt = (n) => '₦' + (parseFloat(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand-blue)', marginBottom: '12px' }}>Service Department</span>
          <h2 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>Repair Manager.</h2>
        </div>
        <button onClick={() => handleOpenForm()} style={{ padding: '12px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', borderRadius: '2px' }}>
          <Plus size={14} /> NEW TICKET
        </button>
      </div>

      {/* ── METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { title: 'Active Repairs', value: tickets.filter(t => t.status !== 'Completed').length, icon: Settings, color: '#3b82f6' },
          { title: 'Awaiting Parts', value: tickets.filter(t => t.status === 'Awaiting Parts').length, icon: AlertTriangle, color: '#f59e0b' },
          { title: 'Ready for Pickup', value: tickets.filter(t => t.status === 'Ready').length, icon: CheckCircle, color: '#10b981' }
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

      {/* ── TICKETS LIST ── */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase' }}>Active Jobs</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.4, fontSize: '12px' }}>Loading Tickets...</div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3, border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)' }}>
              <Tool size={32} style={{ marginBottom: '16px', margin: '0 auto' }} />
              <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>NO REPAIR TICKETS YET.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 100px', gap: '16px', alignItems: 'center', padding: '24px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '14px', fontWeight: 900 }}>{ticket.tracking_id}</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.5, marginTop: '4px' }}>In: {new Date(ticket.created_at).toLocaleDateString('en-GB')}</span>
                </div>
                
                <div>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 800 }}>{ticket.device_model}</span>
                  <span style={{ display: 'block', fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>{ticket.customer_name} {ticket.customer_phone ? `(${ticket.customer_phone})` : ''}</span>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>Status</span>
                  <select 
                    value={ticket.status} 
                    onChange={(e) => updateStatus(ticket.id, e.target.value)}
                    style={{ padding: '6px 12px', border: 'var(--border-thin)', backgroundColor: ticket.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)', color: ticket.status === 'Completed' ? '#10b981' : 'var(--text-primary)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', outline: 'none' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', opacity: 0.5, marginBottom: '4px' }}>Est. Cost</span>
                  <span style={{ display: 'block', fontSize: '13px', fontWeight: 900 }}>{ticket.estimated_cost ? fmt(ticket.estimated_cost) : 'TBD'}</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleOpenForm(ticket)} style={{ padding: '8px', border: 'var(--border-thin)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}><Edit3 size={14} /></button>
                  <button onClick={() => handleDeleteTicket(ticket.id)} style={{ padding: '8px', border: 'var(--border-thin)', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── TICKET MODAL ── */}
      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="fade-in" style={{ width: '600px', maxWidth: '90vw', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '4px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{selectedTicket ? 'Edit Repair Ticket' : 'New Repair Ticket'}</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>Close</button>
            </div>
            <form onSubmit={handleSaveTicket} style={{ padding: '32px', display: 'grid', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Customer Name</label>
                  <input type="text" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Phone Number</label>
                  <input type="text" value={formData.customer_phone} onChange={e => setFormData({...formData, customer_phone: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Device Model</label>
                <input type="text" placeholder="e.g. iPhone 13 Pro Max" value={formData.device_model} onChange={e => setFormData({...formData, device_model: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Issue Description</label>
                <textarea rows="3" placeholder="e.g. Broken screen, battery drains fast" value={formData.issue_description} onChange={e => setFormData({...formData, issue_description: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Estimated Cost (₦)</label>
                  <input type="number" value={formData.estimated_cost} onChange={e => setFormData({...formData, estimated_cost: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Deposit Paid (₦)</label>
                  <input type="number" value={formData.deposit_paid} onChange={e => setFormData({...formData, deposit_paid: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Actual Final Cost (₦)</label>
                  <input type="number" value={formData.actual_cost} onChange={e => setFormData({...formData, actual_cost: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Internal Notes</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }} />
              </div>

              <button type="submit" style={{ padding: '16px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '16px' }}>Save Ticket</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default RepairManager;
