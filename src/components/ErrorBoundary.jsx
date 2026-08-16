import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          fontFamily: 'var(--font-body)',
          padding: '40px',
        }}>
          <div style={{ maxWidth: '480px', textAlign: 'center' }}>
            <p style={{
              fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-dim)', marginBottom: '16px'
            }}>
              OrionSentinel — Runtime Error
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: '2rem',
              fontWeight: 400, color: 'var(--text-main)', marginBottom: '16px'
            }}>
              Something went wrong.
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
              {this.state.error.message}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => this.setState({ error: null })}
                style={{
                  padding: '8px 20px', background: 'var(--text-main)', color: 'var(--bg)',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 20px', background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border-dark)', borderRadius: '8px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
