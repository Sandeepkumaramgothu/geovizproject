
import React, { useRef } from 'react';
import MapView from './components/MapView';
import './App.css';

function App() {
  const mapViewRef = useRef();

  // Handler to export the map as JPG
  const handleExportMap = () => {
    if (mapViewRef.current) {
      mapViewRef.current.exportMapAsImage();
    }
  };

  return (
    <div>
      <nav className="navbar" style={styles.navbar}>
        <h1 className="navbar-title" style={styles.navbarTitle}>
          GeoViz Explorer
        </h1>
        <div style={styles.navbarButtons}>
          <button onClick={handleExportMap} style={styles.navButton}>
            Export as JPG
          </button>
        </div>
      </nav>
      <MapView ref={mapViewRef} />
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
