import React, { useRef } from 'react';
import MapView from './components/MapView';
import html2canvas from 'html2canvas';
import './App.css';

function App() {
  const appRef = useRef();

  // Handler to capture the current view and export it as JPG
  const handleExportView = async () => {
    if (appRef.current) {
      try {
        const canvas = await html2canvas(appRef.current, {
          useCORS: true,
          logging: true,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95); // Get the data URL for JPG format
        const link = document.createElement('a');
        link.href = imgData;
        link.download = 'current_view.jpg';
        link.click();
      } catch (error) {
        console.error('Error capturing the current view:', error);
        alert('Failed to export the current view. Please try again.');
      }
    }
  };

  return (
    <div ref={appRef}>
      <nav className="navbar" style={styles.navbar}>
        <h1 className="navbar-title" style={styles.navbarTitle}>
          GeoViz Explorer
        </h1>
        <div style={styles.navbarButtons}>
          <button onClick={handleExportView} style={styles.navButton}>
            Export View as JPG
          </button>
        </div>
      </nav>
      <MapView />
    </div>
  );
}

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#386994',
    padding: '10px 20px',
    color: '#fff',
  },
  navbarTitle: {
    margin: 0,
  },
  navbarButtons: {
    display: 'flex',
    gap: '10px',
  },
  navButton: {
    padding: '8px 12px',
    backgroundColor: '#8eaebb',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default App;
