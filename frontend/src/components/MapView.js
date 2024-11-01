
import React, { useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import { Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadarController,
  PointElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import styles from './styles';
import { MAPBOX_TOKEN } from './constants';
import blueMarkerIcon from '../assets/images/custom-marker-blue.png';
import redMarkerIcon from '../assets/images/custom-marker-red.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels,
  RadarController,
  PointElement
);

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapWithMarkers = () => {
  const [map, setMap] = useState(null);
  const [geoData, setGeoData] = useState([]);
  const [numericHeaders, setNumericHeaders] = useState([]);
  const [stringHeaders, setStringHeaders] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [chartType, setChartType] = useState('Bar');
  const [chartData, setChartData] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [totalColumns, setTotalColumns] = useState(0);
  const [markers, setMarkers] = useState([]);
  const [currentPopup, setCurrentPopup] = useState(null);

  useEffect(() => {
    const initializeMap = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 3,
    });

    const nav = new mapboxgl.NavigationControl();
    initializeMap.addControl(nav, 'top-right');
    setMap(initializeMap);

    return () => initializeMap.remove();
  }, []);

  const preprocessData = (data) => {
    const cleanData = data.filter(
      (item) =>
        item.latitude &&
        item.longitude &&
        !isNaN(parseFloat(item.latitude)) &&
        !isNaN(parseFloat(item.longitude))
    );
    setGeoData(cleanData);

    const numeric = [];
    const strings = [];
    Object.keys(cleanData[0] || {}).forEach((header) => {
      if (header.toLowerCase() === 'latitude' || header.toLowerCase() === 'longitude') return;

      const isNumeric = cleanData.every((item) => item[header] && !isNaN(item[header]));
      if (isNumeric) {
        numeric.push(header);
      } else {
        strings.push(header);
      }
    });

    setNumericHeaders(numeric);
    setStringHeaders(strings);

    setTotalRows(cleanData.length);
    setTotalColumns(Object.keys(cleanData[0] || {}).length);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            preprocessData(data);
          } catch (error) {
            console.error('Invalid JSON format:', error);
            alert('Error: Uploaded file is not valid JSON.');
          }
        };
        reader.readAsText(file);
      } else if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            preprocessData(results.data);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            alert('Error: Failed to parse CSV file.');
          },
        });
      } else {
        alert('Please upload a valid JSON or CSV file.');
      }
    }
  };

  const handleLocationSelect = (locationData) => {
    if (selectedLocation === locationData) {
      setSelectedLocation(null); // Deselect
      setChartData(null);
      if (currentPopup) currentPopup.remove();
    } else {
      setSelectedLocation(locationData);
      setChartData(null);
      if (currentPopup) currentPopup.remove();
    }
  };

  const generateChartData = useCallback(() => {
    if (!selectedLocation) return;

    const locationValues = numericHeaders.map((header) => ({
      label: header,
      value: parseFloat(selectedLocation[header]) || 0,
    }));

    const totalValue = locationValues.reduce((acc, item) => acc + item.value, 0) || 1; // Avoid divide by zero

    setChartData({
      labels: numericHeaders,
      datasets: [
        {
          label: 'Data Comparison',
          data: locationValues.map((item) => (item.value / totalValue) * 100),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          ],
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  }, [selectedLocation, numericHeaders]);

  useEffect(() => {
    generateChartData();
  }, [generateChartData]);

  useEffect(() => {
    if (map && geoData.length > 0) {
      markers.forEach((marker) => marker.remove());
      const newMarkers = [];

      geoData.forEach((data) => {
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const el = document.createElement('div');
          el.className = 'marker';
          const icon = selectedLocation === data ? redMarkerIcon : blueMarkerIcon;
          el.style.backgroundImage = `url(${icon})`;
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundSize = 'contain';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map);

          marker.getElement().addEventListener('click', () => {
            handleLocationSelect(data);
            if (selectedLocation !== data) {
              const popup = new mapboxgl.Popup({ closeOnClick: true })
                .setLngLat([longitude, latitude])
                .setHTML(`<strong>${data.state || 'Unnamed Location'}</strong>`)
                .addTo(map);
              setCurrentPopup(popup);
            }
          });

          newMarkers.push(marker);
        }
      });
      setMarkers(newMarkers);
    }
  }, [map, geoData, selectedLocation]);

  return (
    <div style={{ ...styles.container, border: '1px solid #ccc' }}>
      <div id="map" style={{ ...styles.map, border: '1px solid #ccc' }}></div>
      <div style={{ ...styles.sidebar, border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
        <div style={{ borderBottom: '2px solid #007BFF', paddingBottom: '5px', marginBottom: '10px' }}>
          <h3>Upload Data</h3>
        </div>
        <input
          type="file"
          accept=".json, .csv"
          onChange={handleFileUpload}
          style={{ ...styles.fileInput, border: '1px solid #ddd', padding: '5px', borderRadius: '4px' }}
        />

        <div style={{ borderBottom: '2px solid #007BFF', paddingBottom: '5px', marginBottom: '10px' }}>
          <h3>Dataset Details</h3>
        </div>
        <div style={styles.datasetDetails}>
          <p><strong>Rows:</strong> {totalRows}</p>
          <p><strong>Columns:</strong> {totalColumns}</p>
          <p><strong>Numeric Columns:</strong> {numericHeaders.join(', ')}</p>
          <p><strong>String Columns:</strong> {stringHeaders.join(', ')}</p>
        </div>

        <div style={{ borderBottom: '2px solid #007BFF', paddingBottom: '5px', marginBottom: '10px' }}>
          <h3>Selected Location</h3>
        </div>
        <p>
          {selectedLocation
            ? selectedLocation.state || `${selectedLocation.latitude}, ${selectedLocation.longitude}`
            : 'No location selected'}
        </p>

        <div style={{ borderBottom: '2px solid #007BFF', paddingBottom: '5px', marginBottom: '10px' }}>
          <h3>Select Chart Type</h3>
        </div>
        <div style={styles.chartOptions}>
          <button onClick={() => setChartType('Bar')}>Bar Chart</button>
          <button onClick={() => setChartType('Pie')}>Pie Chart</button>
          <button onClick={() => setChartType('Radar')}>Radar Chart</button>
          <button onClick={() => setChartType('Doughnut')}>Doughnut Chart</button>
        </div>

        {chartData && (
          <div style={{ ...styles.chartContainer, marginTop: '15px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
            <h3>{chartType} Comparison of Numeric Data</h3>
            {chartType === 'Bar' && <Bar data={chartData} options={chartOptions} />}
            {chartType === 'Pie' && <Pie data={chartData} options={chartOptions} />}
            {chartType === 'Radar' && <Radar data={chartData} options={chartOptions} />}
            {chartType === 'Doughnut' && <Doughnut data={chartData} options={chartOptions} />}
          </div>
        )}
      </div>
    </div>
  );
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: true,
      color: '#fff',
      formatter: (value) => `${value.toFixed(1)}%`,
    },
  },
};

export default MapWithMarkers;


