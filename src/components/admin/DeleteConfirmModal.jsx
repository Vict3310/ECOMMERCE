import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';

const ConfirmModal = ({
  isOpen,
  title = 'Confirm action',
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = false,
  variant = 'confirm',
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const primaryBtnRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (typeof onCancel === 'function') onCancel();
      }
    };
    window.addEventListener('keydown', onKey);
    const id = window.requestAnimationFrame(() => {
      if (variant === 'alert') primaryBtnRef.current?.focus();
      else cancelBtnRef.current?.focus();
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      window.cancelAnimationFrame(id);
    };
  }, [isOpen, variant, onCancel]);

  useLayoutEffect(() => {
    if (isOpen) {
      const ctx = gsap.context(() => {
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.3 });
        gsap.fromTo(
          modalRef.current,
          { scale: 0.8, opacity: 0, y: 20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
        );
      });
      return () => ctx.revert();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10025,
        backgroundColor: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        padding: '24px',
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ifeco-confirm-title"
        style={{
          width: 'calc(100% - 32px)',
          maxWidth: '450px',
          backgroundColor: 'var(--bg-primary)',
          border: 'var(--border-thin)',
          padding: '48px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: danger ? '#FF3B3B18' : '#007BFF18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <AlertTriangle color={danger ? '#FF3B3B' : '#007BFF'} size={32} />
        </div>

        <h2 id="ifeco-confirm-title" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.04em' }}>
          {title}
        </h2>

        <p style={{ fontSize: '14px', opacity: 0.5, marginBottom: '40px', lineHeight: 1.6 }}>
          {message}
        </p>

        {variant === 'alert' ? (
          <button
            ref={primaryBtnRef}
            type="button"
            onClick={onConfirm}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: 'var(--brand-blue)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <button
              ref={cancelBtnRef}
              type="button"
              onClick={onCancel}
              style={{
                padding: '16px',
                border: 'var(--border-thin)',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
              }}
            >
              Cancel
            </button>
            <button
              ref={primaryBtnRef}
              type="button"
              onClick={onConfirm}
              style={{
                padding: '16px',
                backgroundColor: danger ? '#FF3B3B' : 'var(--brand-blue)',
                color: 'white',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              {confirmLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmModal;
