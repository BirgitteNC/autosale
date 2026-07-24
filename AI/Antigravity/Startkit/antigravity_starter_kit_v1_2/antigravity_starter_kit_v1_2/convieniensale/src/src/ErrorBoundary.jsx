import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Hvis vi er på butiksskærmen, skal vi ALDRIG vise røde tekniske fejl til kunderne.
      // I stedet falder vi blødt tilbage til den grønne "Stop Madspild" skærm eller en simpel Meny skærm.
      const isSignage = window.location.pathname.includes('/signage');
      
      if (isSignage) {
        return (
          <div style={{
            height: '100vh', width: '100vw', backgroundColor: '#166534', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
             <h1 style={{fontSize: '5rem', fontWeight: 'bold', marginBottom: '2rem'}}>💚 Stop Madspild</h1>
             <p style={{fontSize: '2rem'}}>Systemet genstarter et øjeblik...</p>
          </div>
        );
      }

      // For medarbejdere/admin: Vis den røde fejlskærm, så de ved, at support skal kontaktes
      return (
        <div style={{ padding: '2rem', background: '#fee2e2', color: '#991b1b', height: '100vh' }}>
          <h2>Noget gik galt (React Crash)</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
            <summary>Vis fejldetaljer</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
             onClick={() => window.location.reload()} 
             style={{marginTop: '2rem', padding: '0.5rem 1rem', background: '#991b1b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
             Genindlæs App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
