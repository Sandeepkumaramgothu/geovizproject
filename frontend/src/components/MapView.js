// src/components/MapView.js

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import 'react-circular-progressbar/dist/styles.css';

import styles from './styles'; // Ensure this file exists and is properly configured
import preprocessData from './preprocessData'; // Ensure this file exists and is properly configured
import { MAPBOX_TOKEN } from './constants'; // Ensure this file contains your Mapbox token
import blueMarkerIcon from '../assets/images/custom-marker-blue.png'; // Ensure these assets exist
import redMarkerIcon from '../assets/images/custom-marker-red.png';
import yellowMarkerIcon from '../assets/images/custom-marker-yellow.png'; // Add this icon for comparison markers
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

// Custom Loading Bar Component
const LoadingBar = ({ progress }) => (
  <div style={{ width: '100%', backgroundColor: '#ddd', height: '10px', borderRadius: '5px' }}>
    <div
      style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#28a745',
        borderRadius: '5px',
        transition: 'width 0.3s ease',
      }}
    ></div>
  </div>
);

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
  const [stateList, setStateList] = useState([]);
  const [selectedState1, setSelectedState1] = useState('');
  const [selectedState2, setSelectedState2] = useState('');
  const [locationColumn, setLocationColumn] = useState('');
  const [markersAdded, setMarkersAdded] = useState(false);
  const [dataNeedsGeocoding, setDataNeedsGeocoding] = useState(false);
  const [compareMarkersEnabled, setCompareMarkersEnabled] = useState(false);
  const [stateCoordinates, setStateCoordinates] = useState({});

  // Global Min and Max for Normalization
  const [globalMinMax, setGlobalMinMax] = useState({});

  // Ref for map container
  const mapContainerRef = useRef(null);

  // Initialize Map on component mount
  useEffect(() => {
    const initializeMap = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3,
    });

    // Add navigation control (zoom buttons)
    const nav = new mapboxgl.NavigationControl();
    initializeMap.addControl(nav, 'top-right');

    setMap(initializeMap);

    // Clean up on unmount
    return () => initializeMap.remove();
  }, []);

  // Reverse Geocode Function to get State Name
  const reverseGeocodeState = useCallback(async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?types=region&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].text.trim().toUpperCase();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }, []);

  // Geocode Function to get coordinates from location name
  const geocodeLocation = useCallback(async (locationName) => {
    if (!locationName) return { latitude: null, longitude: null };
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationName
        )}.json?access_token=${MAPBOX_TOKEN}&limit=1`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        return { latitude, longitude };
      }
      return { latitude: null, longitude: null };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { latitude: null, longitude: null };
    }
  }, []);

  // Generate Chart Data for Selected Location
  const generateChartData = useCallback(
    (locationData) => {
      if (locationData) {
        const locationValues = numericHeaders.map((header) => ({
          label: header,
          value: parseFloat(locationData[header]) || 0,
        }));

        const normalizedValues = locationValues.map((item) => {
          const { min, max } = globalMinMax[item.label] || { min: 0, max: 1 };
          const normalizedValue =
            max !== min ? ((item.value - min) / (max - min)) * 9.5 + 0.5 : 5;
          return {
            label: item.label,
            normalizedValue: isFinite(normalizedValue) ? normalizedValue : 0.5,
            actualValue: item.value,
          };
        });

        setChartData({
          labels: normalizedValues.map((item) => item.label),
          datasets: [
            {
              label: locationData.state,
              data: normalizedValues.map((item) => item.normalizedValue),
              actualValues: normalizedValues.map((item) => item.actualValue),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)',
                'rgba(255, 159, 64, 0.5)',
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
    },
    [numericHeaders, globalMinMax]
  );

  // Handle Location Selection from Map
  const handleLocationSelect = useCallback(
    (locationData) => {
      console.log('Marker clicked:', locationData);

      setSelectedState1('');
      setSelectedState2('');
      setCompareMarkersEnabled(false);

      // If the clicked state is already selected, deselect it
      if (selectedLocation && selectedLocation.state === locationData.state) {
        setSelectedLocation(null);
        setChartData(null);
      } else {
        // Select the clicked state and generate chart data for it
        setSelectedLocation(locationData);
        generateChartData(locationData);
      }
    },
    [selectedLocation, generateChartData]
  );

  // Data Generation
  useEffect(() => {
    if (selectedLocation) {
      generateChartData(selectedLocation);
    } else {
      setChartData(null);
    }
    // We can safely omit generateChartData from dependencies because it doesn't change
  }, [selectedLocation]);

  // Preprocess Data Function
  const handlePreprocess = useCallback(
    async (rawData) => {
      setProgress((prev) => ({ ...prev, preprocess: 0 }));

      // Remove null, undefined, and inconsistent data rows
      const cleanRawData = rawData.filter(
        (item) => item !== null && item !== undefined && Object.keys(item).length > 0
      );

      // Determine if data contains latitude and longitude
      const dataContainsLatLng = cleanRawData.some(
        (item) => item.latitude && item.longitude
      );

      setDataNeedsGeocoding(!dataContainsLatLng);

      // Determine the location column dynamically (case-insensitive)
      const possibleLocationColumns = ['state', 'province', 'city'];
      let detectedLocationColumn = possibleLocationColumns.find((col) =>
        cleanRawData[0] &&
        Object.keys(cleanRawData[0]).some((key) => key.toLowerCase() === col.toLowerCase())
      );

      setLocationColumn(detectedLocationColumn || '');

      console.log('Detected Location Column:', detectedLocationColumn);

      if (!detectedLocationColumn && !dataContainsLatLng) {
        alert('No valid location column found in the dataset.');
        return;
      }

      // Preprocess data
      const processedData = await preprocessData(
        cleanRawData,
        setProgress
      );

      console.log('Number of Data Points After Preprocessing:', processedData.length);

      if (!processedData || processedData.length === 0) {
        alert('No data available after filtering.');
        return;
      }

      setProgress((prev) => ({ ...prev, preprocess: 50 }));

      // Initialize state data aggregation
      const stateDataMap = {};
      const stateCoordsMap = {};
      const numericFields = new Set();

      if (detectedLocationColumn || dataContainsLatLng) {
        for (const item of processedData) {
          let stateName = '';

          if (detectedLocationColumn) {
            stateName = item[detectedLocationColumn];
            if (detectedLocationColumn.toLowerCase().includes('city')) {
              // If the location column is a city, we need to get the state name
              const coords = await geocodeLocation(stateName);
              if (coords.latitude && coords.longitude) {
                stateName = await reverseGeocodeState(coords.latitude, coords.longitude);
                if (!stateName) continue;
              } else {
                continue;
              }
            } else {
              stateName = stateName.trim().toUpperCase();
            }
          } else if (dataContainsLatLng) {
            const latitude = parseFloat(item.latitude);
            const longitude = parseFloat(item.longitude);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              stateName = await reverseGeocodeState(latitude, longitude);
              if (stateName) {
                stateName = stateName.trim().toUpperCase();
              } else {
                continue;
              }
            } else {
              continue;
            }
          }

          if (!stateName) continue;

          // Aggregate data per state
          if (!stateDataMap[stateName]) {
            stateDataMap[stateName] = { ...item };
            stateDataMap[stateName].state = stateName;
            stateDataMap[stateName].count = 1;

            // Store coordinates for the first occurrence
            const latitude = parseFloat(item.latitude);
            const longitude = parseFloat(item.longitude);
            if (!isNaN(latitude) && !isNaN(longitude)) {
              stateCoordsMap[stateName] = { latitude, longitude };
            }
          } else {
            // Sum numeric fields
            Object.keys(item).forEach((key) => {
              if (key.toLowerCase() === 'state') return;
              const value = parseFloat(item[key]);
              if (!isNaN(value)) {
                numericFields.add(key);
                stateDataMap[stateName][key] =
                  (stateDataMap[stateName][key] || 0) + value;
              }
            });
            stateDataMap[stateName].count += 1;
          }
        }
      }

      setProgress((prev) => ({ ...prev, preprocess: 80 }));

      // Calculate averages for numeric fields
      const aggregatedData = Object.values(stateDataMap).map((item) => {
        const count = item.count || 1;
        numericFields.forEach((key) => {
          const parsedValue = parseFloat(item[key]);
          if (!isNaN(parsedValue)) {
            item[key] = parsedValue / count;
          } else {
            item[key] = 0;
          }
        });
        return item;
      });

      setGeoData(aggregatedData);
      setStateCoordinates(stateCoordsMap);

      // Identify numeric and string headers
      if (aggregatedData.length > 0) {
        const headers = Object.keys(aggregatedData[0]);
        const numeric = [];
        const strings = [];

        headers.forEach((header) => {
          if (
            [
              'latitude',
              'longitude',
              'GeoLocation',
              'locationID',
              'count',
              'state',
            ].includes(header)
          )
            return;

          const isNumeric = aggregatedData.every((item) => {
            const value = parseFloat(item[header]);
            return !isNaN(value);
          });
          if (isNumeric) {
            numeric.push(header);
          } else {
            strings.push(header);
          }
        });

        // Calculate global min and max for each numeric field BEFORE setting state
        const globalMinMaxCalc = {};
        numeric.forEach((header) => {
          const values = aggregatedData.map((item) => parseFloat(item[header]));
          globalMinMaxCalc[header] = {
            min: Math.min(...values),
            max: Math.max(...values),
          };
        });
        setGlobalMinMax(globalMinMaxCalc);

        setNumericHeaders(numeric);
        setStringHeaders(strings);

        setTotalRows(aggregatedData.length);
        setTotalColumns(headers.length);

        // Extract unique states for comparison
        const uniqueStates = Object.keys(stateDataMap);
        setStateList(uniqueStates);
      } else {
        alert('No data available after filtering.');
      }

      setProgress((prev) => ({ ...prev, preprocess: 100 }));

      // Reset markersAdded state when new data is uploaded
      setMarkersAdded(false);
    },
    [reverseGeocodeState, geocodeLocation, preprocessData]
  );

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
                line.toLowerCase().startsWith('country name') ||
                line.toLowerCase().startsWith('state') ||
                line.toLowerCase().startsWith('rowid') ||
                line.toLowerCase().startsWith('longitude') ||
                line.toLowerCase().startsWith('latitude')
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

  // Markers on Map
  const renderMarkers = useCallback(() => {
    if (map && geoData.length > 0) {
      if (stateList.length === 0) {
        alert('Data is not aggregated by state. Cannot mark locations on the map.');
        return;
      }

      // Remove existing markers
      markers.forEach((marker) => marker.remove());
      const newMarkers = [];

      geoData.forEach((data) => {
        const stateName = data.state;
        const coords = stateCoordinates[stateName];
        if (!coords) return;

        const latitude = parseFloat(coords.latitude);
        const longitude = parseFloat(coords.longitude);

        if (!isNaN(latitude) && !isNaN(longitude)) {
          const el = document.createElement('div');
          el.className = 'marker';
          const isSelected = selectedLocation
            ? selectedLocation.state === data.state
            : false;
          const isCompared = compareMarkersEnabled
            ? [selectedState1, selectedState2].includes(stateName)
            : false;
          const icon = isSelected
            ? redMarkerIcon
            : isCompared
            ? yellowMarkerIcon
            : blueMarkerIcon;
          el.style.backgroundImage = `url(${icon})`;
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundSize = 'contain';
          el.style.cursor = 'pointer';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([longitude, latitude])
            .addTo(map);

          // Add popup with state name
          const popup = new mapboxgl.Popup({ offset: 25 }).setText(stateName);
          marker.setPopup(popup);

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
  }, [
    map,
    geoData,
    selectedLocation,
    stateCoordinates,
    markers,
    stateList,
    compareMarkersEnabled,
    selectedState1,
    selectedState2,
    handleLocationSelect,
  ]);

  // Re-render markers when selectedLocation or comparison changes
  useEffect(() => {
    if (markersAdded) {
      renderMarkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, compareMarkersEnabled]);

  // Handle State Comparison Selection
  const handleStateSelection = () => {
    if (selectedState1 && selectedState2) {
      const data1 = geoData.find((item) => item.state === selectedState1);
      const data2 = geoData.find((item) => item.state === selectedState2);

      if (!data1 || !data2) {
        alert('One or both selected states have no data.');
        return;
      }

      const labels = numericHeaders;
      const dataset = {
        labels,
        datasets: [
          {
            label: selectedState1,
            data: numericHeaders.map((header) => {
              const value = data1[header] || 0;
              const { min, max } = globalMinMax[header] || { min: 0, max: 1 };
              const normalizedValue =
                max !== min ? ((value - min) / (max - min)) * 9.5 + 0.5 : 5;
              return isFinite(normalizedValue) ? normalizedValue : 0.5;
            }),
            actualValues: numericHeaders.map((header) => data1[header] || 0),
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
          {
            label: selectedState2,
            data: numericHeaders.map((header) => {
              const value = data2[header] || 0;
              const { min, max } = globalMinMax[header] || { min: 0, max: 1 };
              const normalizedValue =
                max !== min ? ((value - min) / (max - min)) * 9.5 + 0.5 : 5;
              return isFinite(normalizedValue) ? normalizedValue : 0.5;
            }),
            actualValues: numericHeaders.map((header) => data2[header] || 0),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      };

      setChartData(dataset);
      setSelectedLocation(null);
      setCompareMarkersEnabled(true);

      // Render the markers for the selected states
      renderMarkers();
    }
  };

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
        align: 'center',
        anchor: 'center',
        formatter: function (value, context) {
          const dataset = context.chart.data.datasets[context.datasetIndex];
          if (dataset.actualValues) {
            const actualValue = dataset.actualValues[context.dataIndex];
            if (typeof actualValue === 'number' && isFinite(actualValue)) {
              return actualValue.toFixed(2);
            } else {
              return '';
            }
          } else {
            if (typeof value === 'number' && isFinite(value)) {
              return value.toFixed(2);
            } else {
              return '';
            }
          }
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const actualValue = dataset.actualValues
              ? dataset.actualValues[context.dataIndex]
              : context.parsed.y;
            if (typeof actualValue === 'number' && isFinite(actualValue)) {
              return `${context.label}: ${actualValue.toFixed(2)}`;
            } else {
              return `${context.label}: ${actualValue || ''}`;
            }
          },
        },
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Map Container */}
      <div ref={mapContainerRef} style={styles.map}></div>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        {/* Combined Controls Box */}
        <div style={styles.combinedBox}>
          {/* Progress Indicators */}
          <div style={styles.progressContainer}>
            <div style={styles.progressItem}>
              <LoadingBar progress={progress.upload} />
              <div style={styles.progressMessage}>{progressMessages.upload}</div>
            </div>
            <div style={styles.progressItem}>
              <LoadingBar progress={progress.preprocess} />
              <div style={styles.progressMessage}>{progressMessages.preprocess}</div>
            </div>
            {dataNeedsGeocoding && (
              <div style={styles.progressItem}>
                <LoadingBar progress={progress.geocode} />
                <div style={styles.progressMessage}>{progressMessages.geocode}</div>
              </div>
            )}
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
          {geoData.length > 0 && stateList.length > 0 && !markersAdded && (
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
          {stateList.length >= 2 ? (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Compare Two States</h3>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>State 1:</label>
                <select
                  value={selectedState1}
                  onChange={(e) => setSelectedState1(e.target.value)}
                  style={styles.selectDropdown}
                  disabled={stateList.length === 0}
                >
                  <option value="">Select State</option>
                  {stateList.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>State 2:</label>
                <select
                  value={selectedState2}
                  onChange={(e) => setSelectedState2(e.target.value)}
                  style={styles.selectDropdown}
                  disabled={stateList.length === 0}
                >
                  <option value="">Select State</option>
                  {stateList.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleStateSelection}
                disabled={!selectedState1 || !selectedState2}
                style={{
                  ...styles.chartButton,
                  backgroundColor:
                    selectedState1 && selectedState2 ? '#28a745' : '#6c757d',
                }}
              >
                Compare
              </button>
            </div>
          ) : geoData.length > 0 ? (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Compare Two States</h3>
              <p style={{ color: '#6c757d' }}>
                Comparison is Enabled when the dataset contains at least two unique states.
              </p>
            </div>
          ) : null}

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
