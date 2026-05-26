import React from 'react';

/**
 * Catches render errors in child trees so the whole app does not go blank.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            backgroundColor: 'var(--bg-primary, #0a0a0a)',
            color: 'var(--text-primary, #fafafa)',
          }}
        >
          <div style={{ maxWidth: '420px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '16px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '13px', opacity: 0.65, lineHeight: 1.6, marginBottom: '28px', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '14px 28px',
                backgroundColor: 'var(--brand-blue, #007bff)',
                color: '#fff',
                border: 'none',
                borderRadius: '2px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.12em',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
