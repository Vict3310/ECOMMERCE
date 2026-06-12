import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabase';
import { DollarSign, TrendingDown, TrendingUp, Plus, Trash2, Calendar, FileText, PieChart, Wallet } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const EXPENSE_CATEGORIES = [
  'Rent & Utilities',
  'Inventory Purchases',
  'Salaries & Wages',
  'Marketing',
  'Logistics',
  'Equipment & Software',
  'Miscellaneous'
];

const AccountingProtocol = () => {
  const { showNotification, showConfirmDialog, orders } = useAppContext();
  
  const [expenses, setExpenses] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    const [expensesRes, receiptsRes] = await Promise.all([
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('receipt_history').select('*')
    ]);
    
    if (expensesRes.data) setExpenses(expensesRes.data);
    if (receiptsRes.data) setReceipts(receiptsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate financials
  const financials = useMemo(() => {
    // Total from physical receipts
    const receiptTotal = receipts.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
    // Total from online orders
    const orderTotal = orders.reduce((sum, o) => sum + (parseFloat(o.total || o.price) || 0), 0);
    
    const grossRevenue = receiptTotal + orderTotal;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    
    const netProfit = grossRevenue - totalExpenses;
    const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

    return { grossRevenue, totalExpenses, netProfit, profitMargin };
  }, [expenses, receipts, orders]);

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) {
      showNotification('Amount and description are required', 'error');
      return;
    }

    const { error } = await supabase.from('expenses').insert({
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date
    });

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification('Expense logged successfully', 'success');
      setIsFormOpen(false);
      setFormData({ category: EXPENSE_CATEGORIES[0], amount: '', description: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    }
  };

  const handleDeleteExpense = (id) => {
    showConfirmDialog({
      title: 'Delete Expense',
      message: 'Are you sure you want to delete this expense record?',
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        const { error } = await supabase.from('expenses').delete().eq('id', id);
        if (error) showNotification(error.message, 'error');
        else {
          showNotification('Expense removed', 'success');
          setExpenses(expenses.filter(e => e.id !== id));
        }
      }
    });
  };

  const fmt = (n) => '₦' + (parseFloat(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ display: 'inline-block', fontSize: '10px', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--brand-blue)', marginBottom: '12px' }}>Financial Control</span>
          <h2 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1 }}>Accounting Protocol.</h2>
        </div>
        <button onClick={() => setIsFormOpen(true)} style={{ padding: '12px 24px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none', borderRadius: '2px' }}>
          <Plus size={14} /> LOG EXPENSE
        </button>
      </div>

      {/* ── METRICS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        {[
          { title: 'Gross Revenue', value: fmt(financials.grossRevenue), icon: TrendingUp, color: '#10b981', sub: 'Total Inflow' },
          { title: 'Total Expenses', value: fmt(financials.totalExpenses), icon: TrendingDown, color: '#ef4444', sub: 'Total Outflow' },
          { title: 'True Net Profit', value: fmt(financials.netProfit), icon: Wallet, color: '#3b82f6', sub: `${financials.profitMargin}% Margin` }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', border: 'var(--border-thin)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6 }}>{stat.title}</span>
                <Icon size={16} color={stat.color} />
              </div>
              <span style={{ fontSize: '32px', fontWeight: 900 }}>{stat.value}</span>
              <span style={{ fontSize: '10px', fontWeight: 800, opacity: 0.5 }}>{stat.sub}</span>
            </div>
          );
        })}
      </div>

      {/* ── EXPENSE LOG ── */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: 800, letterSpacing: '0.1em', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase' }}>Expense Registry</h3>
        <div style={{ border: 'var(--border-thin)', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px 150px 60px', gap: '16px', padding: '16px 24px', backgroundColor: 'var(--bg-secondary)', borderBottom: 'var(--border-thin)' }}>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Date</span>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Description</span>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5 }}>Category</span>
            <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.5, textAlign: 'right' }}>Amount</span>
            <span />
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.4, fontSize: '12px' }}>Loading Financials...</div>
          ) : expenses.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
              <FileText size={32} style={{ marginBottom: '16px', margin: '0 auto' }} />
              <p style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.1em' }}>NO EXPENSES LOGGED YET.</p>
            </div>
          ) : (
            expenses.map((exp) => (
              <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 200px 150px 60px', gap: '16px', alignItems: 'center', padding: '16px 24px', borderBottom: 'var(--border-thin)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{new Date(exp.date).toLocaleDateString('en-GB')}</span>
                <span style={{ fontSize: '13px' }}>{exp.description}</span>
                <span style={{ padding: '4px 8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '2px', fontSize: '10px', fontWeight: 800, display: 'inline-block', width: 'fit-content' }}>{exp.category}</span>
                <span style={{ fontSize: '14px', fontWeight: 900, textAlign: 'right', color: '#ef4444' }}>-{fmt(exp.amount)}</span>
                <button onClick={() => handleDeleteExpense(exp.id)} style={{ padding: '8px', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.5 }} className="hover-opacity-100">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── LOG EXPENSE MODAL ── */}
      {isFormOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="fade-in" style={{ width: '500px', maxWidth: '90vw', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', borderRadius: '4px' }}>
            <div style={{ padding: '24px', borderBottom: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Log New Expense</h3>
              <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5 }}>Close</button>
            </div>
            <form onSubmit={handleSaveExpense} style={{ padding: '32px', display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Date</label>
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Amount (₦)</label>
                <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', opacity: 0.6 }}>Description</label>
                <input type="text" placeholder="e.g. June Shop Rent" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px', border: 'var(--border-thin)', backgroundColor: 'transparent', color: 'var(--text-primary)', outline: 'none' }} required />
              </div>
              <button type="submit" style={{ padding: '16px', backgroundColor: 'var(--brand-blue)', color: '#fff', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', border: 'none', cursor: 'pointer', marginTop: '16px' }}>Save Expense</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountingProtocol;
