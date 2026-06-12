import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Printer, Plus, Trash2, Eye, RotateCcw, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../supabase';

const INPUT_STYLE = {
  width: '100%', padding: '14px 16px',
  backgroundColor: 'var(--bg-primary)',
  border: 'var(--border-thin)',
  color: 'var(--text-primary)',
  fontWeight: 700,
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const LABEL_STYLE = {
  display: 'block', fontSize: '9px', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.12em',
  marginBottom: '8px', color: 'var(--text-primary)', opacity: 0.6,
};

const EMPTY_LINE = { description: '', qty: '1', unitPrice: '' };

const ReceiptGenerator = () => {
  const { siteSettings, showNotification } = useAppContext();

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    date: new Date().toISOString().split('T')[0],
    method: 'Cash',
    warranty: '7 days',
    notes: '',
    discount: '',
    status: 'PAID',
  });

  const [lineItems, setLineItems] = useState([{ ...EMPTY_LINE }]);
  const [receipt, setReceipt] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    const { data } = await supabase
      .from('receipt_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setHistory(data);
    setHistoryLoading(false);
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLineChange = (i, field, value) => {
    const updated = [...lineItems];
    updated[i][field] = value;
    setLineItems(updated);
  };

  const addLine = () => setLineItems([...lineItems, { ...EMPTY_LINE }]);

  const removeLine = (i) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((_, idx) => idx !== i));
  };

  const getSubtotal = (items) =>
    items.reduce((sum, item) => {
      const qty = parseFloat(item.qty) || 0;
      const price = parseFloat(item.unitPrice) || 0;
      return sum + qty * price;
    }, 0);

  const handleGenerate = () => {
    if (!form.customerName) {
      showNotification('Customer name is required.', 'error');
      return;
    }
    if (lineItems.some(l => !l.description || !l.unitPrice)) {
      showNotification('All line items need a description and price.', 'error');
      return;
    }

    const subtotal = getSubtotal(lineItems);
    const discountAmt = parseFloat(form.discount) || 0;
    const total = Math.max(0, subtotal - discountAmt);

    setReceipt({
      ...form,
      customerEmail: form.customerEmail || '',
      id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      formattedDate: new Date(form.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
      }),
      lineItems: lineItems.map(l => ({
        ...l,
        total: (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
      })),
      subtotal,
      discountAmt,
      total,
    });
  };

  const handlePrint = async () => {
    if (!receipt) {
      showNotification('Generate the receipt preview first.', 'error');
      return;
    }
    // Save receipt history
    await supabase.from('receipt_history').insert({
      receipt_id: receipt.id,
      customer_name: receipt.customerName,
      customer_phone: receipt.customerPhone || null,
      customer_email: receipt.customerEmail || null,
      customer_address: receipt.customerAddress || null,
      total: receipt.total,
      status: receipt.status,
      method: receipt.method,
      line_items: receipt.lineItems,
      date: receipt.date,
      notes: receipt.notes || null,
      discount: receipt.discountAmt || 0,
    });
    // Upsert marketing contact
    if (receipt.customerPhone || receipt.customerEmail) {
      await supabase.from('marketing_contacts').upsert(
        { name: receipt.customerName, phone: receipt.customerPhone || null, email: receipt.customerEmail || null },
        { onConflict: 'phone' }
      );
    }
    fetchHistory();
    const originalTitle = document.title;
    document.title = `Receipt ${receipt.id} – ${siteSettings?.name || 'Store'}`;
    window.print();
    document.title = originalTitle;
    showNotification('Receipt saved to history.', 'success');
  };

  const handleReset = () => {
    setForm({
      customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
      date: new Date().toISOString().split('T')[0],
      method: 'Cash', warranty: '7 days', notes: '', discount: '', status: 'PAID',
    });
    setLineItems([{ ...EMPTY_LINE }]);
    setReceipt(null);
  };

  const fmt = (n) => '₦' + (parseFloat(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="receipt-generator-container fade-in">

      {/* ───── SCREEN UI ───── */}
      <div className="no-print">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 1, color: 'var(--text-primary)' }}>Receipt.</h2>
            <p style={{ fontSize: '11px', opacity: 0.4, fontWeight: 700, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>GENERATE & PRINT PROFESSIONAL RECEIPTS</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleReset} style={{ padding: '12px 20px', border: 'var(--border-thin)', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)', backgroundColor: 'transparent' }}>
              <RotateCcw size={14} /> RESET
            </button>
            <button onClick={handleGenerate} style={{ padding: '12px 24px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
              <Eye size={14} /> PREVIEW
            </button>
            <button onClick={handlePrint} disabled={!receipt} style={{ padding: '12px 24px', backgroundColor: receipt ? 'var(--brand-blue)' : 'transparent', border: receipt ? 'none' : 'var(--border-thin)', color: receipt ? '#FFF' : 'var(--text-primary)', opacity: receipt ? 1 : 0.4, fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', cursor: receipt ? 'pointer' : 'not-allowed' }}>
              <Printer size={14} /> PRINT
            </button>
          </div>
        </div>

        {/* ── HISTORY PANEL ── */}
        <div style={{ marginBottom: '32px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)' }}>
          <button
            onClick={() => setShowHistory(h => !h)}
            style={{ width: '100%', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Clock size={14} /> RECEIPT HISTORY ({history.length})
            </span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showHistory && (
            <div style={{ borderTop: 'var(--border-thin)', maxHeight: '380px', overflowY: 'auto' }}>
              {historyLoading && <p style={{ padding: '24px', fontSize: '11px', opacity: 0.5 }}>Loading...</p>}
              {!historyLoading && history.length === 0 && (
                <p style={{ padding: '24px', fontSize: '11px', opacity: 0.4, textAlign: 'center' }}>No receipts generated yet.</p>
              )}
              {history.map(h => (
                <div key={h.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 60px', gap: '16px', alignItems: 'center', padding: '14px 24px', borderBottom: 'var(--border-thin)' }}>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 800 }}>{h.receipt_id}</p>
                    <p style={{ fontSize: '9px', opacity: 0.5 }}>{new Date(h.created_at).toLocaleDateString('en-GB')}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700 }}>{h.customer_name}</p>
                    <p style={{ fontSize: '9px', opacity: 0.5 }}>{h.customer_phone || h.customer_email || '—'}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 900 }}>{fmt(h.total)}</p>
                    <p style={{ fontSize: '9px', opacity: 0.5, textTransform: 'uppercase' }}>{h.status}</p>
                  </div>
                  <button
                    onClick={() => {
                      const items = h.line_items || [];
                      const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
                      setReceipt({
                        ...h,
                        customerName: h.customer_name,
                        customerPhone: h.customer_phone,
                        customerEmail: h.customer_email,
                        customerAddress: h.customer_address,
                        formattedDate: new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
                        lineItems: items,
                        subtotal,
                        discountAmt: h.discount || 0,
                      });
                    }}
                    style={{ padding: '8px', border: 'var(--border-thin)', fontSize: '9px', fontWeight: 800, cursor: 'pointer', color: 'var(--text-primary)', background: 'none', textTransform: 'uppercase' }}
                  >
                    VIEW
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Two-column layout: form + preview */}
        <div style={{ display: 'grid', gridTemplateColumns: receipt ? '1fr 1fr' : '1fr', gap: '24px', alignItems: 'start' }}>

          {/* ── FORM ── */}
          <div style={{ display: 'grid', gap: '20px' }}>

            {/* Customer Info */}
            <section style={{ border: 'var(--border-thin)', padding: '28px', backgroundColor: 'var(--bg-secondary)' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px', opacity: 0.5 }}>CUSTOMER DETAILS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}>Customer Name *</label>
                  <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="e.g. Sarah Williams" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Phone Number</label>
                  <input name="customerPhone" value={form.customerPhone} onChange={handleChange} placeholder="08012345678" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Email (Optional)</label>
                  <input name="customerEmail" value={form.customerEmail || ''} onChange={handleChange} placeholder="customer@email.com" style={INPUT_STYLE} />
                </div>
                <div>
                  <label style={LABEL_STYLE}>Date</label>
                  <input type="date" name="date" value={form.date} onChange={handleChange} style={INPUT_STYLE} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}>Customer Address (Optional)</label>
                  <input name="customerAddress" value={form.customerAddress} onChange={handleChange} placeholder="e.g. 12 Allen Avenue, Lagos" style={INPUT_STYLE} />
                </div>
              </div>
            </section>

            {/* Line Items */}
            <section style={{ border: 'var(--border-thin)', padding: '28px', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.5 }}>LINE ITEMS *</p>
                <button onClick={addLine} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--brand-blue)', cursor: 'pointer', background: 'none', border: 'none' }}>
                  <Plus size={12} /> ADD ITEM
                </button>
              </div>

              {/* Column headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 32px', gap: '8px', marginBottom: '8px' }}>
                <span style={{ ...LABEL_STYLE, marginBottom: 0 }}>Description</span>
                <span style={{ ...LABEL_STYLE, marginBottom: 0, textAlign: 'center' }}>Qty</span>
                <span style={{ ...LABEL_STYLE, marginBottom: 0, textAlign: 'right' }}>Unit Price</span>
                <span />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                {lineItems.map((line, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 100px 32px', gap: '8px', alignItems: 'center' }}>
                    <input value={line.description} onChange={e => handleLineChange(i, 'description', e.target.value)} placeholder="Service / Item name" style={INPUT_STYLE} />
                    <input type="number" value={line.qty} onChange={e => handleLineChange(i, 'qty', e.target.value)} min="1" style={{ ...INPUT_STYLE, textAlign: 'center', padding: '14px 8px' }} />
                    <input type="number" value={line.unitPrice} onChange={e => handleLineChange(i, 'unitPrice', e.target.value)} placeholder="0.00" style={{ ...INPUT_STYLE, textAlign: 'right', padding: '14px 8px' }} />
                    <button onClick={() => removeLine(i)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'var(--border-thin)', color: '#FF3B3B', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.3 : 1, background: 'none' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Running subtotal */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '16px', borderTop: 'var(--border-thin)' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, opacity: 0.6 }}>SUBTOTAL: {fmt(getSubtotal(lineItems))}</span>
              </div>
            </section>

            {/* Payment & Options */}
            <section style={{ border: 'var(--border-thin)', padding: '28px', backgroundColor: 'var(--bg-secondary)' }}>
              <p style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '20px', opacity: 0.5 }}>PAYMENT & OPTIONS</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={LABEL_STYLE}>Payment Method</label>
                  <select name="method" value={form.method} onChange={handleChange} style={INPUT_STYLE}>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                    <option>POS</option>
                    <option>Crypto</option>
                    <option>Credit</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} style={INPUT_STYLE}>
                    <option>PAID</option>
                    <option>PENDING</option>
                    <option>PARTIAL</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Warranty</label>
                  <select name="warranty" value={form.warranty} onChange={handleChange} style={INPUT_STYLE}>
                    <option>None</option>
                    <option>3 days</option>
                    <option>7 days</option>
                    <option>14 days</option>
                    <option>1 month</option>
                    <option>3 months</option>
                    <option>6 months</option>
                    <option>1 year</option>
                  </select>
                </div>
                <div>
                  <label style={LABEL_STYLE}>Discount (₦)</label>
                  <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="0.00" style={INPUT_STYLE} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={LABEL_STYLE}>Internal Notes (appears on receipt)</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="e.g. Device was water-damaged before repair" rows="2" style={{ ...INPUT_STYLE, resize: 'vertical' }} />
                </div>
              </div>
            </section>
          </div>

          {/* ── SCREEN PREVIEW ── */}
          {receipt && (
            <div style={{ position: 'sticky', top: '24px', border: '2px solid var(--border-color)', backgroundColor: '#fff', color: '#111', fontFamily: 'Georgia, serif', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
              <ReceiptPreview receipt={receipt} siteSettings={siteSettings} fmt={fmt} />
            </div>
          )}
        </div>
      </div>

      {/* ───── PRINT OUTPUT ───── */}
      {receipt && (
        <div id="invoice-print-area" className="print-only-area" style={{ display: 'none' }}>
          <ReceiptPreview receipt={receipt} siteSettings={siteSettings} fmt={fmt} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────── */
/* Shared receipt layout used for both preview */
/* and print                                   */
/* ─────────────────────────────────────────── */
const ReceiptPreview = ({ receipt, siteSettings, fmt }) => {
  const statusColor = receipt.status === 'PAID' ? '#15803d' : receipt.status === 'PENDING' ? '#b45309' : '#1d4ed8';
  const storeName = siteSettings?.name || 'Derin Tech';
  const logo = siteSettings?.logo || null;
  const address = siteSettings?.address || 'Shop 20, Adejoke Plaza, 1 Oshitelu Street, Computer Village, Ikeja, Lagos';
  const phone = siteSettings?.phone || '0808 236 8115';
  const email = siteSettings?.email || '';

  return (
    <div style={{ padding: '40px', backgroundColor: '#fff', color: '#111', fontFamily: '"Georgia", serif', position: 'relative', overflow: 'hidden' }}>

      {/* Diagonal status stamp */}
      <div style={{ position: 'absolute', top: '48px', right: '32px', border: `2px solid ${statusColor}`, color: statusColor, fontWeight: 900, fontSize: '12px', padding: '4px 12px', transform: 'rotate(-12deg)', letterSpacing: '0.2em', opacity: 0.25, fontFamily: 'sans-serif', pointerEvents: 'none' }}>
        {receipt.status}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0d9488', paddingBottom: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {logo && (
            <div style={{ width: '60px', height: '60px', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
              <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, margin: 0, fontFamily: 'sans-serif', letterSpacing: '-0.02em' }}>{storeName.toUpperCase()}</h1>
            <p style={{ fontSize: '10px', color: '#0d9488', fontWeight: 700, margin: '2px 0 0', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gadget Sales &amp; Repairs</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontFamily: 'sans-serif' }}>RECEIPT</h2>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0', fontFamily: 'sans-serif' }}>Date: <strong style={{ color: '#111' }}>{receipt.formattedDate}</strong></p>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0', fontFamily: 'sans-serif' }}>Receipt #: <strong style={{ color: '#111' }}>{receipt.id}</strong></p>
        </div>
      </div>

      {/* Addresses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '24px' }}>
        <div>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'sans-serif' }}>FROM</p>
          <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px', fontFamily: 'sans-serif' }}>{storeName}</p>
          <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0', lineHeight: 1.5 }}>{address}</p>
          {phone && <p style={{ fontSize: '11px', color: '#374151', margin: '4px 0', fontFamily: 'sans-serif' }}>📞 {phone}</p>}
          {email && <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0', fontFamily: 'sans-serif' }}>✉ {email}</p>}
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '9px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'sans-serif' }}>BILL TO</p>
          <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 4px', fontFamily: 'sans-serif' }}>{receipt.customerName}</p>
          {receipt.customerPhone && <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>📞 {receipt.customerPhone}</p>}
          {receipt.customerAddress && <p style={{ fontSize: '11px', color: '#374151', margin: '2px 0' }}>{receipt.customerAddress}</p>}
          <p style={{ fontSize: '11px', color: '#374151', margin: '4px 0', fontFamily: 'sans-serif' }}>Payment: <span style={{ fontWeight: 600 }}>{receipt.method}</span></p>
          <p style={{ fontSize: '11px', margin: '2px 0', fontFamily: 'sans-serif' }}>Status: <span style={{ fontWeight: 700, color: statusColor }}>{receipt.status}</span></p>
        </div>
      </div>

      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0', fontFamily: 'sans-serif' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', borderTop: '1px solid #9ca3af', borderBottom: '1px solid #9ca3af' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1f2937' }}>Description</th>
            <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1f2937', width: '50px' }}>Qty</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1f2937', width: '90px' }}>Unit Price</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1f2937', width: '90px' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {receipt.lineItems.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '10px 12px', fontSize: '12px', color: '#111', whiteSpace: 'pre-wrap' }}>{item.description}</td>
              <td style={{ padding: '10px 12px', fontSize: '12px', textAlign: 'center', color: '#374151' }}>{item.qty}</td>
              <td style={{ padding: '10px 12px', fontSize: '12px', textAlign: 'right', color: '#374151' }}>{fmt(item.unitPrice)}</td>
              <td style={{ padding: '10px 12px', fontSize: '12px', textAlign: 'right', fontWeight: 700, color: '#111' }}>{fmt(item.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '1px solid #d1d5db', backgroundColor: '#f9fafb' }}>
            <td colSpan="3" style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif' }}>Subtotal</td>
            <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#111' }}>{fmt(receipt.subtotal)}</td>
          </tr>
          {receipt.discountAmt > 0 && (
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <td colSpan="3" style={{ padding: '8px 12px', textAlign: 'right', fontSize: '11px', color: '#6b7280', fontFamily: 'sans-serif' }}>Discount</td>
              <td style={{ padding: '8px 12px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>-{fmt(receipt.discountAmt)}</td>
            </tr>
          )}
          <tr style={{ backgroundColor: '#f3f4f6', borderTop: '2px solid #9ca3af' }}>
            <td colSpan="3" style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#111', fontFamily: 'sans-serif' }}>TOTAL AMOUNT</td>
            <td style={{ padding: '12px', textAlign: 'right', fontSize: '18px', fontWeight: 900, color: '#111' }}>{fmt(receipt.total)}</td>
          </tr>
        </tfoot>
      </table>

      {/* Warranty & Notes */}
      {(receipt.warranty !== 'None' || receipt.notes) && (
        <div style={{ marginTop: '20px', border: '1px solid #e5e7eb', padding: '16px', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' }}>
          {receipt.warranty !== 'None' && (
            <div style={{ marginBottom: receipt.notes ? '12px' : 0 }}>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '6px' }}>WARRANTY</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '10px', color: '#374151' }}>
                <p style={{ margin: '2px 0' }}>• Warranty: {receipt.warranty} from date of purchase</p>
                <p style={{ margin: '2px 0' }}>• Physical damage voids warranty</p>
                <p style={{ margin: '2px 0' }}>• 3-day return policy</p>
                <p style={{ margin: '2px 0' }}>• Receipt required for all returns</p>
              </div>
            </div>
          )}
          {receipt.notes && (
            <div>
              <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', marginBottom: '4px' }}>NOTES</p>
              <p style={{ fontSize: '11px', color: '#374151', margin: 0 }}>{receipt.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Signatures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '40px', marginBottom: '16px', fontFamily: 'sans-serif' }}>
        {['Customer Signature', 'Authorized Signature'].map(label => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{ borderBottom: '1px solid #9ca3af', margin: '0 24px 6px' }} />
            <p style={{ fontSize: '9px', fontWeight: 600, color: '#374151', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p style={{ color: '#0d9488', fontWeight: 700, margin: '0 0 4px', fontSize: '12px' }}>Thank you for choosing {storeName}!</p>
        <p style={{ fontSize: '10px', color: '#6b7280', margin: 0 }}>"Your satisfaction is our priority"</p>
      </div>
    </div>
  );
};

export default ReceiptGenerator;
