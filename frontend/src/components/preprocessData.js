

import axios from 'axios';
import { MAPBOX_TOKEN, MAPBOX_GEOCODING_URL } from './constants';


const extractCoordinates = (geoLocation) => {
  if (!geoLocation) return { latitude: null, longitude: null };
  const regex = /POINT\s*\(\s*([-.\d]+)\s+([-.\d]+)\s*\)/i;
  const match = geoLocation.match(regex);
  if (match) {
    return {
      longitude: parseFloat(match[1]),
      latitude: parseFloat(match[2]),
    };
  }
  return { latitude: null, longitude: null };
};


const geocodeLocation = async (locationName) => {
  if (!locationName) return { latitude: null, longitude: null };
  try {
    const response = await axios.get(
      `${MAPBOX_GEOCODING_URL}${encodeURIComponent(locationName)}.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1,
        },
      }
    );
    const features = response.data.features;
    if (features && features.length > 0) {
      const [longitude, latitude] = features[0].center;
      return { latitude, longitude };
    }
    return { latitude: null, longitude: null };
  } catch (error) {
    console.error('Geocoding error:', error);
    return { latitude: null, longitude: null };
  }
};

/**
 * Preprocesses raw data to extract coordinates, classify locations, and structure data for visualization.
 * @param {Array} data - The raw data array (from CSV or JSON).
 * @param {Function} setProgress - Function to update progress percentages.
 * @param {string} locationColumn - The column name that contains location information.
 * @returns {Promise<Array>} - The processed and cleaned data array.
 */
const preprocessData = async (data, setProgress, locationColumn) => {
  // Initialize progress
  setProgress({
    upload: 100,
    preprocess: 0,
    geocode: 0,
  });


  const limitedData = data.slice(0, 100000);

  setProgress((prev) => ({ ...prev, preprocess: 10 }));

 
  const possibleLatitudeFields = ['latitude', 'Latitude', 'lat', 'Lat'];
  const possibleLongitudeFields = ['longitude', 'Longitude', 'lon', 'Lng', 'Long'];

  let latitudeField = null;
  let longitudeField = null;

  if (limitedData.length > 0) {
    latitudeField = possibleLatitudeFields.find((field) =>
      limitedData[0].hasOwnProperty(field)
    );
    longitudeField = possibleLongitudeFields.find((field) =>
      limitedData[0].hasOwnProperty(field)
    );
  } else {
    alert('The dataset is empty.');
    return [];
  }

  setProgress((prev) => ({ ...prev, preprocess: 20 }));

  
  const requiredFields = [];
  if (!latitudeField || !longitudeField) {
    requiredFields.push(locationColumn);
  }

  const cleanData = limitedData.filter((row) => {
    return requiredFields.every(
      (field) =>
        row.hasOwnProperty(field) &&
        row[field] !== null &&
        row[field] !== undefined &&
        row[field] !== ''
    );
  });

  if (cleanData.length === 0) {
    alert('No valid data after filtering out rows with missing critical fields.');
    return [];
  }

  setProgress((prev) => ({ ...prev, preprocess: 30 }));


  if (!latitudeField || !longitudeField) {
    if (cleanData.length > 0) {
      latitudeField = possibleLatitudeFields.find((field) =>
        cleanData[0].hasOwnProperty(field)
      );
      longitudeField = possibleLongitudeFields.find((field) =>
        cleanData[0].hasOwnProperty(field)
      );
    }
  }


  const dataWithCoords = await Promise.all(
    cleanData.map(async (item) => {
      let latitude = null;
      let longitude = null;

      if (latitudeField && longitudeField) {
        latitude = parseFloat(item[latitudeField]);
        longitude = parseFloat(item[longitudeField]);
      } else if (item.GeoLocation) {
        const coords = extractCoordinates(item.GeoLocation);
        latitude = coords.latitude;
        longitude = coords.longitude;
      } else if (item[locationColumn] && locationColumn !== 'locationID') {
        // Geocode if we have a location name
        const coords = await geocodeLocation(item[locationColumn]);
        latitude = coords.latitude;
        longitude = coords.longitude;
      }

      const locationID =
        latitude !== null && longitude !== null
          ? `${latitude.toFixed(5)},${longitude.toFixed(5)}`
          : null;

      return { ...item, latitude, longitude, locationID };
    })
  );

  setProgress((prev) => ({ ...prev, preprocess: 70 }));


  const cleanDataWithCoords = dataWithCoords.filter(
    (item) =>
      item.latitude !== null &&
      item.longitude !== null &&
      !isNaN(item.latitude) &&
      !isNaN(item.longitude)
  );

  if (cleanDataWithCoords.length === 0) {
    alert('No valid data after extracting coordinates.');
    return [];
  }

  setProgress((prev) => ({ ...prev, preprocess: 90 }));

  setProgress((prev) => ({ ...prev, preprocess: 100 }));

  return cleanDataWithCoords;
};

export default preprocessData;
