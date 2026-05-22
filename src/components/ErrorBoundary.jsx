import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="wrap" style={{ paddingTop: 80, textAlign: "center", color: "var(--text-2)" }}>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Bir şeyler ters gitti.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              fontSize: 13, fontWeight: 700, padding: "8px 20px",
              background: "var(--text-1)", color: "var(--bg)",
              border: "none", borderRadius: "var(--radius-md)", cursor: "pointer",
            }}
          >
            Tekrar dene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
