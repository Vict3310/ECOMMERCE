import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { FileText, Printer } from 'lucide-react';

const ReceiptGenerator = () => {
  const { siteSettings } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    item: '',
    price: '',
    method: 'Cash'
  });
  
  const [receiptData, setReceiptData] = useState(null);
  
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleGenerate = () => {
    if (!formData.name || !formData.item || !formData.price) {
      alert('Please fill in Name, Item, and Price.');
      return;
    }
    
    setReceiptData({
      ...formData,
      id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
      formattedDate: formData.date ? new Date(formData.date).toLocaleDateString() : new Date().toLocaleDateString(),
      formattedPrice: '₦' + parseFloat(formData.price).toLocaleString()
    });
  };
  
  const handlePrint = () => {
    if (!receiptData) {
      alert('Please generate the receipt first!');
      return;
    }
    const originalTitle = document.title;
    document.title = 'Receipt - ' + (siteSettings.name || 'Derin Tech');
    window.print();
    document.title = originalTitle;
  };

  return (
    <div className="receipt-generator-container fade-in">
      <div className="no-print" style={{ padding: '48px', backgroundColor: 'var(--bg-primary)' }}>
         <h2 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', marginBottom: '32px', color: 'var(--text-primary)' }}>
            RECEIPT GENERATOR
         </h2>
         
         <div style={{ display: 'grid', gap: '24px', backgroundColor: 'var(--bg-secondary)', padding: '32px', border: 'var(--border-thin)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
               <div>
                 <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-primary)' }}>CUSTOMER NAME</label>
                 <input name="name" value={formData.name} onChange={handleChange} placeholder="SARAH WILLIAMS" style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontWeight: 800 }} />
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-primary)' }}>DATE</label>
                 <input type="date" name="date" value={formData.date} onChange={handleChange} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontWeight: 800 }} />
               </div>
            </div>
            
            <div>
               <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-primary)' }}>ITEM / SERVICE DESCRIPTION (ENTER FOR NEW LINE)</label>
               <textarea name="item" value={formData.item} onChange={handleChange} placeholder="IPHONE 13 PRO MAX SCREEN REPLACEMENT&#10;IMEI: 359123456789012" rows="4" style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontWeight: 800, resize: 'vertical' }} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
               <div>
                 <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-primary)' }}>AMOUNT (₦)</label>
                 <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0.00" style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontWeight: 800 }} />
               </div>
               <div>
                 <label style={{ display: 'block', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', color: 'var(--text-primary)' }}>PAYMENT METHOD</label>
                 <select name="method" value={formData.method} onChange={handleChange} style={{ width: '100%', padding: '16px', backgroundColor: 'var(--bg-primary)', border: 'var(--border-thin)', color: 'var(--text-primary)', fontWeight: 800 }}>
                    <option>CASH</option>
                    <option>BANK TRANSFER</option>
                    <option>POS</option>
                 </select>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', flexWrap: 'wrap' }}>
               <button onClick={handleGenerate} style={{ flex: 1, padding: '16px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', border: 'none' }}>
                  <FileText size={16} /> GENERATE PREVIEW
               </button>
               <button onClick={handlePrint} disabled={!receiptData} style={{ flex: 1, padding: '16px', backgroundColor: receiptData ? 'var(--brand-blue)' : 'var(--border-thin)', color: receiptData ? '#FFF' : 'var(--text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: receiptData ? 'pointer' : 'not-allowed', border: 'none' }}>
                  <Printer size={16} /> PRINT RECEIPT
               </button>
            </div>
         </div>
      </div>

      {receiptData && (
        <div id="invoice-print-area" className="print-only-area" style={{ display: 'none' }}>
           <div className="invoice-header">
              <div className="invoice-branding">
                 <div className="invoice-logo-container">
                    <img src={siteSettings?.logo || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=200&auto=format&fit=crop"} alt="Logo" />
                 </div>
                 <div className="invoice-brand-info">
                    <h1>{siteSettings?.name || "DERIN TECH"}</h1>
                    <p>GADGET SALES & REPAIRS</p>
                 </div>
              </div>
              <div className="invoice-meta">
                 <h2>RECEIPT</h2>
                 <div className="meta-details">
                    <p>Date: <span>{receiptData.formattedDate}</span></p>
                    <p>Receipt #: <span>{receiptData.id}</span></p>
                 </div>
              </div>
           </div>
           
           <div className="invoice-addresses">
              <div className="invoice-from">
                 <h3>FROM</h3>
                 <p className="strong-text">{siteSettings?.name || "Derin Tech"}</p>
                 <p>{siteSettings?.address || "Shop 20, Adejoke Plaza, 1 Oshitelu Street, Beside GTBANK, Computer Village, Ikeja"}</p>
                 <p>{siteSettings?.phone || "0808 236 8115"}</p>
                 <p>{siteSettings?.email || "derinsignature.tech@gmail.com"}</p>
              </div>
              <div className="invoice-to">
                 <h3>BILL TO</h3>
                 <p className="strong-text">{receiptData.name}</p>
                 <p>Payment: <span>{receiptData.method}</span></p>
                 <p>Status: <span className="status-paid">PAID</span></p>
              </div>
           </div>
           
           <table className="invoice-table">
              <thead>
                 <tr>
                    <th className="align-left">Description</th>
                    <th className="align-center width-sm">Qty</th>
                    <th className="align-right width-md">Amount</th>
                 </tr>
              </thead>
              <tbody>
                 <tr>
                    <td className="align-left whitespace-pre-wrap">{receiptData.item}</td>
                    <td className="align-center">1</td>
                    <td className="align-right strong-text">{receiptData.formattedPrice}</td>
                 </tr>
              </tbody>
              <tfoot>
                 <tr>
                    <td colSpan="2" className="align-right strong-text">Total Amount</td>
                    <td className="align-right strong-text total-price">{receiptData.formattedPrice}</td>
                 </tr>
              </tfoot>
           </table>
           
           <div className="invoice-terms">
              <h4>Terms & Conditions</h4>
              <div className="terms-grid">
                 <div>
                    <p>• 7-day warranty on repairs</p>
                    <p>• Physical damage voids warranty</p>
                 </div>
                 <div>
                    <p>• 3-day return policy</p>
                    <p>• Receipt required for returns</p>
                 </div>
              </div>
           </div>
           
           <div className="invoice-signatures">
              <div className="signature-box">
                 <div className="signature-line"></div>
                 <p>Customer Signature</p>
              </div>
              <div className="signature-box">
                 <div className="signature-line"></div>
                 <p>Authorized Signature</p>
              </div>
           </div>
           
           <div className="invoice-footer">
              <p className="footer-thanks">Thank you for choosing {siteSettings?.name || "Derin Tech"}!</p>
              <p className="footer-quote">"Your satisfaction is our priority"</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptGenerator;
