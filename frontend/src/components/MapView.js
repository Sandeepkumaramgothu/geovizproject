// src/components/MapView.js

import React, { useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import Papa from 'papaparse';
import { Bar, Pie, Doughnut, PolarArea } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

import styles from './styles'; // Ensure this file exists and is properly configured
import preprocessData from './preprocessData'; // Ensure this file exists and is properly configured
import { MAPBOX_TOKEN } from './constants'; // Ensure this file exists and contains your Mapbox token
import blueMarkerIcon from '../assets/images/custom-marker-blue.png'; // Ensure these assets exist
import redMarkerIcon from '../assets/images/custom-marker-red.png';
import './marker.css'; // Ensure this CSS file exists for marker styling

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

// Set Mapbox access token
mapboxgl.accessToken = MAPBOX_TOKEN;

const MapView = () => {
  // State Variables
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
  const [progress, setProgress] = useState({
    upload: 0,
    preprocess: 0,
    geocode: 0,
  });
  const [progressMessages, setProgressMessages] = useState({
    upload: '',
    preprocess: '',
    geocode: '',
  });
  const [cityList, setCityList] = useState([]);
  const [selectedCity1, setSelectedCity1] = useState('');
  const [selectedCity2, setSelectedCity2] = useState('');
  const [locationColumn, setLocationColumn] = useState('');
  const [columnValueCounts, setColumnValueCounts] = useState({});
  const [markersAdded, setMarkersAdded] = useState(false);

  // Initialize Map
  useEffect(() => {
    const initializeMap = new mapboxgl.Map({
      container: 'map', // HTML container id
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-98.5795, 39.8283], // starting position [lng, lat] (center of USA)
      zoom: 3, // starting zoom
    });

    // Add navigation control (the +/- zoom buttons)
    const nav = new mapboxgl.NavigationControl();
    initializeMap.addControl(nav, 'top-right');

    setMap(initializeMap);

    // Clean up on unmount
    return () => initializeMap.remove();
  }, []);

  // Preprocess Data Function
  const handlePreprocess = useCallback(
    async (rawData) => {
      // Determine the location column dynamically
      const possibleLocationColumns = [
        'LocationDesc',
        'LocationAbbr',
        'state',
        'State',
        'city',
        'City',
        'Country',
        'Country Name',
        'Country Code',
        'Address',
        'Place',
        'GeoLocation',
        // Include more possible location columns if necessary
      ];
      let detectedLocationColumn = possibleLocationColumns.find(
        (col) => rawData[0] && rawData[0].hasOwnProperty(col)
      );

      // If no location column is found, use 'locationID'
      if (!detectedLocationColumn) {
        detectedLocationColumn = 'locationID';
      }

      setLocationColumn(detectedLocationColumn);
      console.log('Detected Location Column:', detectedLocationColumn);

      // Preprocess data
      const processedData = await preprocessData(
        rawData,
        setProgress,
        detectedLocationColumn
      );

      if (!processedData || processedData.length === 0) {
        alert('No valid data after preprocessing.');
        return;
      }

      setGeoData(processedData);

      // Identify numeric and string headers
      if (processedData.length > 0) {
        const headers = Object.keys(processedData[0]);
        const numeric = [];
        const strings = [];

        headers.forEach((header) => {
          if (
            ['latitude', 'longitude', 'GeoLocation', 'locationID'].includes(header)
          )
            return;

          const isNumeric = processedData.every((item) => {
            const value = parseFloat(item[header]);
            return !isNaN(value);
          });
          if (isNumeric) {
            numeric.push(header);
          } else {
            strings.push(header);
          }
        });

        setNumericHeaders(numeric);
        setStringHeaders(strings);

        setTotalRows(processedData.length);
        setTotalColumns(headers.length);

        // Count non-null values per column
        const columnCounts = {};
        headers.forEach((header) => {
          const count = processedData.filter(
            (item) => item[header] !== null && item[header] !== ''
          ).length;
          columnCounts[header] = count;
        });

        setColumnValueCounts(columnCounts);

        // Extract unique locations for comparison
        const uniqueLocations = [
          ...new Set(
            processedData.map((item) => item[detectedLocationColumn]).filter(Boolean)
          ),
        ];
        setCityList(uniqueLocations);
      } else {
        alert('No data available after filtering.');
      }

      // Reset markersAdded state when new data is uploaded
      setMarkersAdded(false);
    },
    []
  );

  // Generate a human-readable label for the location
  const getLocationLabel = (data) => {
    if (data[locationColumn]) return data[locationColumn];
    if (data.city) return data.city;
    if (data.state) return data.state;
    if (data.address) return data.address;
    return `Lat: ${parseFloat(data.latitude).toFixed(2)}, Lng: ${parseFloat(
      data.longitude
    ).toFixed(2)}`;
  };

  // Handle File Upload
  const handleFileUpload = (event) => {
    setProgress({
      upload: 0,
      preprocess: 0,
      geocode: 0,
    });
    setProgressMessages({
      upload: '',
      preprocess: '',
      geocode: '',
    });
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();

      if (fileExtension === 'json') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            setProgress((prev) => ({ ...prev, upload: 100 }));
            setProgressMessages((prev) => ({
              ...prev,
              upload: 'Dataset uploaded successfully.',
            }));
            await handlePreprocess(data);
          } catch (error) {
            console.error('Invalid JSON format:', error);
            alert('Error: Uploaded file is not valid JSON.');
          }
        };
        reader.readAsText(file);
      } else if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          beforeFirstChunk: (chunk) => {
            // Handle datasets with metadata rows
            const lines = chunk.trim().split('\n');
            const dataStartIndex = lines.findIndex(
              (line) =>
                line.startsWith('Country Name') ||
                line.startsWith('state') ||
                line.startsWith('RowId')
            );
            if (dataStartIndex > 0) {
              return lines.slice(dataStartIndex).join('\n');
            }
            return chunk;
          },
          complete: async (results) => {
            setProgress((prev) => ({ ...prev, upload: 100 }));
            setProgressMessages((prev) => ({
              ...prev,
              upload: 'Dataset uploaded successfully.',
            }));
            await handlePreprocess(results.data);
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

  // Monitor Progress Updates
  useEffect(() => {
    if (progress.preprocess === 100) {
      setProgressMessages((prev) => ({
        ...prev,
        preprocess: 'Preprocessing completed.',
      }));
    }
  }, [progress.preprocess]);

  useEffect(() => {
    if (progress.geocode === 100) {
      setProgressMessages((prev) => ({
        ...prev,
        geocode: 'Locations marked on the map.',
      }));
    }
  }, [progress.geocode]);

  // Handle Location Selection from Map
  const handleLocationSelect = (locationData) => {
    // Clear city selections if a map marker is selected
    setSelectedCity1('');
    setSelectedCity2('');
    if (selectedLocation && selectedLocation.locationID === locationData.locationID) {
      setSelectedLocation(null); // Deselect
      setChartData(null);
      if (currentPopup) currentPopup.remove();
    } else {
      setSelectedLocation(locationData);
      setChartData(null);
      if (currentPopup) currentPopup.remove();
    }
  };

  // Handle Location Comparison Selection
  const handleCitySelection = () => {
    if (selectedCity1 && selectedCity2) {
      const data1 = geoData.filter(
        (item) => item[locationColumn] === selectedCity1
      );
      const data2 = geoData.filter(
        (item) => item[locationColumn] === selectedCity2
      );

      if (data1.length === 0 || data2.length === 0) {
        alert('One or both selected locations have no data.');
        return;
      }

      // Aggregate data (e.g., average)
      const aggregatedData1 = {};
      const aggregatedData2 = {};

      numericHeaders.forEach((header) => {
        const values1 = data1.map((item) => parseFloat(item[header]) || 0);
        const values2 = data2.map((item) => parseFloat(item[header]) || 0);

        const avg1 = values1.reduce((a, b) => a + b, 0) / (values1.length || 1);
        const avg2 = values2.reduce((a, b) => a + b, 0) / (values2.length || 1);

        aggregatedData1[header] = avg1;
        aggregatedData2[header] = avg2;
      });

      // Normalize data for chart display (0.5% to 10%)
      const dataMin = 0; // Minimum data value
      const dataMax = Math.max(
        ...Object.values(aggregatedData1),
        ...Object.values(aggregatedData2)
      );
      const range = dataMax - dataMin || 1; // Avoid division by zero

      const normalizedData1 = {};
      const normalizedData2 = {};
      const actualData1 = {};
      const actualData2 = {};

      numericHeaders.forEach((header) => {
        normalizedData1[header] =
          ((aggregatedData1[header] - dataMin) / range) * 9.5 + 0.5;
        normalizedData2[header] =
          ((aggregatedData2[header] - dataMin) / range) * 9.5 + 0.5;
        actualData1[header] = aggregatedData1[header];
        actualData2[header] = aggregatedData2[header];
      });

      // Prepare chart data
      const labels = numericHeaders;
      const dataSet = {
        labels,
        datasets: [
          {
            label: selectedCity1,
            data: numericHeaders.map((header) => normalizedData1[header]),
            actualValues: numericHeaders.map((header) => actualData1[header]),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: selectedCity2,
            data: numericHeaders.map((header) => normalizedData2[header]),
            actualValues: numericHeaders.map((header) => actualData2[header]),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };

      setChartData(dataSet);
      setSelectedLocation(null); // Deselect any single location
      if (currentPopup) currentPopup.remove();
    }
  };

  
  const generateChartData = useCallback(() => {
    if (selectedLocation) {
      const locationValues = numericHeaders.map((header) => ({
        label: header,
        value: parseFloat(selectedLocation[header]) || 0,
      }));

     
      const dataMin = 0; // Minimum data value
      const dataMax = Math.max(...locationValues.map((item) => item.value));
      const range = dataMax - dataMin || 1; // Avoid division by zero

      const normalizedValues = locationValues.map((item) => ({
        label: item.label,
        normalizedValue: ((item.value - dataMin) / range) * 9.5 + 0.5,
        actualValue: item.value, // Keep the actual value
      }));

      setChartData({
        labels: normalizedValues.map((item) => item.label),
        datasets: [
          {
            label: getLocationLabel(selectedLocation),
            data: normalizedValues.map((item) => item.normalizedValue),
            actualValues: normalizedValues.map((item) => item.actualValue), // Store actual values
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
             
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [selectedLocation, numericHeaders]);

  //Data Generation
  useEffect(() => {
    generateChartData();
  }, [generateChartData, chartType]);

  //Markers on Map
  const renderMarkers = useCallback(() => {
    if (map && geoData.length > 0) {
      // Remove existing markers
      markers.forEach((marker) => marker.remove());
      const newMarkers = [];

      geoData.forEach((data) => {
        const latitude = parseFloat(data.latitude);
        const longitude = parseFloat(data.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const el = document.createElement('div');
          el.className = 'marker';
          const isSelected = selectedLocation
            ? selectedLocation.locationID === data.locationID
            : false;
          const icon = isSelected ? redMarkerIcon : blueMarkerIcon;
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
          });

          newMarkers.push(marker);
        }
      });
      setMarkers(newMarkers);
      setMarkersAdded(true); 

    
      setProgress((prev) => ({ ...prev, geocode: 100 }));
      setProgressMessages((prev) => ({
        ...prev,
        geocode: 'Locations marked on the map.',
      }));
    }
  }, [map, geoData, selectedLocation]);

  // Re-render markers when selectedLocation changes to update marker colors
  useEffect(() => {
    if (markersAdded) {
      renderMarkers();
    }
  }, [selectedLocation, renderMarkers, markersAdded]);

  // Chart Options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales:
      chartType === 'Bar'
        ? {
            y: {
              beginAtZero: true,
              min: 0.5,
              max: 10,
            },
          }
        : {},
    plugins: {
      legend: {
        position: 'top',
      },
      datalabels: {
        display: true,
        color: '#000',
        align: 'center', // Align labels to the center of the bars
        anchor: 'center',
        formatter: function (value, context) {
          const dataset = context.chart.data.datasets[context.datasetIndex];
          if (dataset.actualValues) {
            const actualValue = dataset.actualValues[context.dataIndex];
            return actualValue.toFixed(2); // Display actual value
          } else {
            return value.toFixed(2);
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            if (dataset.actualValues) {
              const actualValue = dataset.actualValues[context.dataIndex];
              return `${context.label}: ${actualValue.toFixed(2)}`;
            } else {
              return `${context.label}: ${context.parsed.y}`;
            }
          },
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Map Container */}
      <div id="map" style={styles.map}></div>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Combined Controls Box */}
        <div style={styles.combinedBox}>
          {/* Progress Indicators */}
          <div style={styles.progressContainer}>
            <div style={styles.progressItem}>
              <CircularProgressbar
                value={progress.upload}
                text={`${Math.round(progress.upload)}%`}
                styles={{
                  root: { width: '80px' },
                  text: { fontSize: '10px' },
                }}
              />
              <div style={styles.progressMessage}>{progressMessages.upload}</div>
            </div>
            <div style={styles.progressItem}>
              <CircularProgressbar
                value={progress.preprocess}
                text={`${Math.round(progress.preprocess)}%`}
                styles={{
                  root: { width: '80px' },
                  text: { fontSize: '10px' },
                }}
              />
              <div style={styles.progressMessage}>{progressMessages.preprocess}</div>
            </div>
            <div style={styles.progressItem}>
              <CircularProgressbar
                value={progress.geocode}
                text={`${Math.round(progress.geocode)}%`}
                styles={{
                  root: { width: '80px' },
                  text: { fontSize: '10px' },
                }}
              />
              <div style={styles.progressMessage}>{progressMessages.geocode}</div>
            </div>
          </div>

          {/* Upload Data Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Upload Data</h3>
            <input
              type="file"
              accept=".json, .csv"
              onChange={handleFileUpload}
              style={styles.fileInput}
            />
          </div>

          {/* Mark Locations Button */}
          {geoData.length > 0 && !markersAdded && (
            <div style={styles.section}>
              <button
                onClick={renderMarkers}
                style={{
                  ...styles.chartButton,
                  backgroundColor: '#17a2b8',
                  width: '100%',
                }}
              >
                Mark Locations on Map
              </button>
            </div>
          )}

          {/* Dataset Details Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Dataset Details</h3>
            {geoData.length > 0 ? (
              <div style={styles.datasetDetails}>
                <p>
                  <strong>Rows:</strong> {totalRows}
                </p>
                <p>
                  <strong>Columns:</strong> {totalColumns}
                </p>
                <p>
                  <strong>Numeric Columns:</strong> {numericHeaders.join(', ')}
                </p>
                <p>
                  <strong>String Columns:</strong> {stringHeaders.join(', ')}
                </p>
              </div>
            ) : (
              <p>No dataset uploaded yet.</p>
            )}
          </div>

          {/* Location Comparison Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Compare Two Locations</h3>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Location 1:</label>
              <select
                value={selectedCity1}
                onChange={(e) => setSelectedCity1(e.target.value)}
                style={styles.selectDropdown}
                disabled={cityList.length === 0}
              >
                <option value="">Select Location</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Location 2:</label>
              <select
                value={selectedCity2}
                onChange={(e) => setSelectedCity2(e.target.value)}
                style={styles.selectDropdown}
                disabled={cityList.length === 0}
              >
                <option value="">Select Location</option>
                {cityList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleCitySelection}
              disabled={!selectedCity1 || !selectedCity2}
              style={{
                ...styles.chartButton,
                backgroundColor:
                  selectedCity1 && selectedCity2 ? '#28a745' : '#6c757d',
              }}
            >
              Compare
            </button>
          </div>

          {/* Chart Type Selection Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Select Chart Type</h3>
            <div style={styles.chartOptions}>
              <button
                onClick={() => setChartType('Bar')}
                style={{
                  ...styles.chartButton,
                  ...(chartType === 'Bar' ? styles.chartButtonActive : {}),
                }}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setChartType('Pie')}
                style={{
                  ...styles.chartButton,
                  ...(chartType === 'Pie' ? styles.chartButtonActive : {}),
                }}
              >
                Pie Chart
              </button>
              <button
                onClick={() => setChartType('Doughnut')}
                style={{
                  ...styles.chartButton,
                  ...(chartType === 'Doughnut' ? styles.chartButtonActive : {}),
                }}
              >
                Doughnut Chart
              </button>
              <button
                onClick={() => setChartType('PolarArea')}
                style={{
                  ...styles.chartButton,
                  ...(chartType === 'PolarArea' ? styles.chartButtonActive : {}),
                }}
              >
                PolarArea Chart
              </button>
            </div>
          </div>
        </div>

        {/* Chart Display Section */}
        {chartData && (
          <div style={styles.chartContainer}>
            <div style={styles.chartWrapper}>
              <div style={styles.chartContent}>
                <h3>{chartType} Chart</h3>
                {chartType === 'Bar' && <Bar data={chartData} options={chartOptions} />}
                {chartType === 'Pie' && <Pie data={chartData} options={chartOptions} />}
                {chartType === 'Doughnut' && (
                  <Doughnut data={chartData} options={chartOptions} />
                )}
                {chartType === 'PolarArea' && (
                  <PolarArea data={chartData} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
