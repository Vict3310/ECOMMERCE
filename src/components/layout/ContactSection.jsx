import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ContactSection = () => {
  const { siteSettings } = useAppContext();

  return (
    <section id="contact" className="thin-border-bottom" style={{ padding: '100px 0', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="grid-mobile-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px' }}>
          
          {/* Left: Reach Out */}
          <div>
            <h2 style={{ fontSize: '64px', marginBottom: '32px', letterSpacing: '-0.06em', lineHeight: '1.1' }}>
              VISIT OUR <br/> OFFICE.
            </h2>
            <p style={{ opacity: 0.6, fontSize: '14px', maxWidth: '300px', marginBottom: '48px' }}>
              We are located in the heart of Computer Village. Come experience 
              elite tech retail first-hand.
            </p>
            
            <div style={{ display: 'flex', gap: '24px' }}>
            </div>
          </div>

          {/* Right: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            
            <div className="thin-border-bottom" style={{ paddingBottom: '32px' }}>
              <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', display: 'block' }}>Location</span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <MapPin size={18} strokeWidth={2} style={{ marginTop: '4px' }} />
                <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>{siteSettings.address}</p>
              </div>
            </div>

            <div className="thin-border-bottom" style={{ paddingBottom: '32px' }}>
              <span style={{ fontSize: '10px', opacity: 0.4, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px', display: 'block' }}>Contact</span>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <Phone size={18} strokeWidth={2} />
                <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>{siteSettings.phone}</p>
              </div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <Mail size={18} strokeWidth={2} />
                <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>{siteSettings.email}</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;
