// src/App.js

import React, { useState } from 'react';
import MapView from './components/MapView';
import './App.css'; // Import the CSS file for styling

function App() {
  const [geoData, setGeoData] = useState(null);

  return (
    <div>
      <nav className="navbar">
        <h1 className="navbar-title">GeoViz Explorer</h1>
      </nav>
      <MapView geoData={geoData} setGeoData={setGeoData} />
    </div>
  );
}

export default App;
