

import axios from 'axios';
import { MAPBOX_TOKEN } from './constants';


const geocodeLocation = async (locationName) => {
  if (!locationName) return { latitude: null, longitude: null };
  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        locationName
      )}.json`,
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

const preprocessData = async (data, setProgress) => {
  setProgress((prev) => ({ ...prev, preprocess: 0 }));

  const limitedData = data.slice(0, 100000); 

  setProgress((prev) => ({ ...prev, preprocess: 10 }));

  const possibleLatitudeFields = ['latitude', 'Latitude', 'lat', 'Lat', 'LATITUDE', 'LAT'];
  const possibleLongitudeFields = ['longitude', 'Longitude', 'lon', 'Lng', 'Long', 'LONGITUDE', 'LNG', 'LON'];

  const possibleLocationFields = [
    'city',
    'City',
    'CITY',
    'county',
    'County',
    'COUNTY',
    'state',
    'State',
    'STATE',
    'state_name',
    'State_Name',
    'STATE_NAME',
  ];

 
  const firstRow = limitedData[0];


  let latitudeField = possibleLatitudeFields.find((field) => field in firstRow);

  let longitudeField = possibleLongitudeFields.find((field) => field in firstRow);

  let locationField = possibleLocationFields.find((field) => field in firstRow);

  setProgress((prev) => ({ ...prev, preprocess: 20 }));

  const requiredFields = [];
  if (!latitudeField || !longitudeField) {
    if (locationField) {
      requiredFields.push(locationField);
    }
  }

  const cleanData = limitedData.filter((row) => {
    if (requiredFields.length > 0) {
      return requiredFields.every(
        (field) =>
          row.hasOwnProperty(field) &&
          row[field] !== null &&
          row[field] !== undefined &&
          row[field].toString().trim() !== ''
      );
    } else {
      return row !== null && row !== undefined && Object.keys(row).length > 0;
    }
  });

  if (cleanData.length === 0) {
    alert('No data available after filtering out rows with missing critical fields.');
    return [];
  }

  setProgress((prev) => ({ ...prev, preprocess: 30 }));

  let dataWithCoords;

  if (latitudeField && longitudeField) {
    dataWithCoords = cleanData.map((item) => {
      const latitude = parseFloat(item[latitudeField]);
      const longitude = parseFloat(item[longitudeField]);
      possibleLatitudeFields.forEach((field) => {
        delete item[field];
      });
      possibleLongitudeFields.forEach((field) => {
        delete item[field];
      });

      return { ...item, latitude, longitude };
    });
  } else if (locationField) {
    // We need to geocode the location names to get coordinates
    dataWithCoords = await Promise.all(
      cleanData.map(async (item) => {
        let latitude = null;
        let longitude = null;
        let locationName = item[locationField];

        const coords = await geocodeLocation(locationName);
        latitude = coords.latitude;
        longitude = coords.longitude;
        possibleLatitudeFields.forEach((field) => {
          delete item[field];
        });
        possibleLongitudeFields.forEach((field) => {
          delete item[field];
        });

        return { ...item, latitude, longitude };
      })
    );
  } else {
    dataWithCoords = cleanData;
  }

  setProgress((prev) => ({ ...prev, preprocess: 70 }));



  setProgress((prev) => ({ ...prev, preprocess: 90 }));

  setProgress((prev) => ({ ...prev, preprocess: 100 }));

  return dataWithCoords;
};

export default preprocessData;
