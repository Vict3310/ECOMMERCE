import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Contact = () => {
  const { siteSettings } = useAppContext();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Contact Header */}
      <section className="thin-border-bottom" style={{ padding: '120px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 className="mobile-text-giant" style={{ fontSize: '120px', letterSpacing: '-0.06em', marginBottom: '24px', lineHeight: 0.85 }}>CONTACT.</h1>
            <p style={{ fontSize: '18px', fontWeight: 800, opacity: 0.6, letterSpacing: '-0.03em' }}>
              Elite gadgets deserve elite support. Access our technical specialists 24/7 or visit our Computer Village flagship store.
            </p>
          </div>
        </div>
      </section>

      <div className="container grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '80px', padding: '100px 24px' }}>
        
        {/* Left: Contact Info */}
        <aside>
          <div className="thin-border-bottom" style={{ marginBottom: '60px', paddingBottom: '48px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px', opacity: 0.4 }}>LOCATION.</h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
               <MapPin size={24} style={{ opacity: 0.4 }} />
               <div>
                  <p style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1.4, marginBottom: '8px' }}>{siteSettings.address}</p>
                  <p style={{ fontSize: '14px', opacity: 0.5, fontWeight: 800 }}>FLAGSHIP STORE | IKEJA, LAGOS</p>
               </div>
            </div>
          </div>

          <div className="thin-border-bottom" style={{ marginBottom: '60px', paddingBottom: '48px' }}>
            <h3 style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px', opacity: 0.4 }}>DIRECT CHANNELS.</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <Phone size={24} style={{ opacity: 0.4 }} />
                  <p style={{ fontSize: '20px', fontWeight: 800 }}>{siteSettings.phone}</p>
               </div>
               <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <Mail size={24} style={{ opacity: 0.4 }} />
                  <p style={{ fontSize: '20px', fontWeight: 800 }}>{siteSettings.email}</p>
               </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px', opacity: 0.4 }}>OFFICE HOURS.</h3>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
               <Clock size={24} style={{ opacity: 0.4 }} />
               <div>
                  <p style={{ fontSize: '16px', fontWeight: 800 }}>MON - SAT / 09:00 - 18:00</p>
                  <p style={{ fontSize: '12px', opacity: 0.5 }}>GLOBAL SUPPORT 24/7 VIA WHATSAPP</p>
               </div>
            </div>
          </div>
        </aside>

        {/* Right: Contact Form */}
        <main>
          <div style={{ padding: '64px', border: 'var(--border-thin)', backgroundColor: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '48px' }}>GENERAL INQUIRY.</h3>
            
            {submitted ? (
              <div className="fade-in" style={{ textAlign: 'center', padding: '60px 0' }}>
                 <CheckCircle size={64} style={{ margin: '0 auto 24px', opacity: 0.8 }} />
                 <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>INQUIRY RECEIVED.</h4>
                 <p style={{ fontSize: '14px', opacity: 0.6 }}>A technical specialist will reach out within 60 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
                <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                   <div>
                      <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Full Name</label>
                      <input required type="text" placeholder="e.g. John Doe" style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: 'var(--border-thin)', padding: '12px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', outline: 'none' }} />
                   </div>
                   <div>
                      <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Email Address</label>
                      <input required type="email" placeholder="e.g. john@elite.com" style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: 'var(--border-thin)', padding: '12px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', outline: 'none' }} />
                   </div>
                </div>
                <div>
                   <label style={{ fontSize: '9px', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', marginBottom: '12px', display: 'block' }}>Inquiry Details</label>
                   <textarea required placeholder="How can we elevate your tech stack?" style={{ width: '100%', backgroundColor: 'transparent', border: 'none', borderBottom: 'var(--border-thin)', padding: '12px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', outline: 'none', minHeight: '120px', resize: 'none' }} />
                </div>
                <button type="submit" style={{ padding: '24px', backgroundColor: 'var(--brand-blue)', color: 'var(--bg-primary)', fontSize: '12px', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                   Send Inquiry <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* Map Integration */}
      <section className="thin-border-top" style={{ height: '500px', backgroundColor: 'var(--bg-secondary)', overflow: 'hidden', filter: 'grayscale(1) contrast(1.1)' }}>
         <iframe 
          src={siteSettings.googleMapsUrl} 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          allowFullScreen="" 
          loading="lazy"
        ></iframe>
      </section>
    </div>
  );
};

export default Contact;
