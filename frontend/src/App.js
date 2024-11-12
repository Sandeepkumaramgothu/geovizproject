import React from 'react';
import MapView from './components/MapView';
import './App.css'; 

function App() {
  return (
    <div>
      <nav className="navbar">
        <h1 className="navbar-title">GeoViz Explorer</h1>
      </nav>
      <MapView />
    </div>
  );
}

export default App;
