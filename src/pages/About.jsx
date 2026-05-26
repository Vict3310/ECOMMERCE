import React from 'react';
import { ShieldCheck, Truck, Clock, Award, Users, Globe } from 'lucide-react';

const About = () => {
  const milestones = [
    { year: '2015', title: 'FOUNDATION.', desc: 'Ifeco Gadgets established in the heart of Computer Village with a mission to redefine tech retail.' },
    { year: '2019', title: 'ELITE STATUS.', desc: 'Recognized as the premier destination for UK Used and Brand New premium electronics.' },
    { year: '2024', title: 'PLATFORM V2.0.', desc: 'Legacy transition into the digital elite with a global-standard boutique shopping engine.' }
  ];

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Hero Section */}
      <section className="thin-border-bottom" style={{ padding: '160px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ maxWidth: '850px' }}>
            <h1 style={{ fontSize: '120px', letterSpacing: '-0.06em', marginBottom: '48px', lineHeight: 0.85 }}>
              ELITE <br/> TECHNOLOGY.
            </h1>
            <p style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.4, opacity: 0.8 }}>
              At Ifeco Gadgets, we don't just sell electronics. We curate technical excellence. 
              Since our inception, we have been the silent engine powering the digital elite of Lagos.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Grid */}
      <section className="thin-border-bottom">
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', backgroundColor: 'var(--border-thin)' }}>
          <div style={{ padding: '80px', backgroundColor: 'var(--bg-primary)' }}>
             <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px', opacity: 0.5 }}>OUR PHILOSOPHY.</h3>
             <p style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.6 }}>Uncompromising quality control for every item, whether Brand New or UK Used. We understand that your tools define your potential.</p>
          </div>
          <div style={{ padding: '80px', backgroundColor: 'var(--bg-primary)' }}>
             <h3 style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.2em', marginBottom: '32px', opacity: 0.5 }}>THE STANDARDS.</h3>
             <p style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.6 }}>Every UK Used device undergoes a 45-point technical inspection to ensure it performs at 100% capacity from the moment of unboxing.</p>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="thin-border-bottom" style={{ padding: '100px 0' }}>
         <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
            <div style={{ textAlign: 'center' }}>
               <ShieldCheck size={32} style={{ marginBottom: '24px', opacity: 0.4 }} />
               <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>CERTIFIED GENUINE.</h4>
               <p style={{ fontSize: '11px', opacity: 0.6 }}>Direct authentic supply chain.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <Truck size={32} style={{ marginBottom: '24px', opacity: 0.4 }} />
               <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>ELITE DELIVERY.</h4>
               <p style={{ fontSize: '11px', opacity: 0.6 }}>Same-day within Lagos Metro.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <Clock size={32} style={{ marginBottom: '24px', opacity: 0.4 }} />
               <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>ZERO LATENCY.</h4>
               <p style={{ fontSize: '11px', opacity: 0.6 }}>24/7 technical consultation.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
               <Award size={32} style={{ marginBottom: '24px', opacity: 0.4 }} />
               <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>PREMIUM WARRANTY.</h4>
               <p style={{ fontSize: '11px', opacity: 0.6 }}>Full post-sales support.</p>
            </div>
         </div>
      </section>

      {/* Timeline Section */}
      <section style={{ padding: '120px 0', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.4em', marginBottom: '80px', opacity: 0.4, textAlign: 'center' }}>THE LEGACY.</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '60px' }}>
             {milestones.map(m => (
               <div key={m.year}>
                 <h3 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.05em', marginBottom: '16px' }}>{m.year}</h3>
                 <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '16px' }}>{m.title}</h4>
                 <p style={{ fontSize: '14px', opacity: 0.6, lineHeight: 1.8 }}>{m.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Office Section */}
      <section className="thin-border-top" style={{ padding: '120px 0' }}>
         <div className="container" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.4em', marginBottom: '48px', opacity: 0.4 }}>LOCATION.</h2>
            <p style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', maxWidth: '600px', margin: '0 auto' }}>
              VISIT OUR FLAGSHIP STORE IN COMPUTER VILLAGE, IKEJA.
            </p>
         </div>
      </section>
    </div>
  );
};

export default About;
