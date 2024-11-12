

import axios from 'axios';
import { MAPBOX_TOKEN } from './constants';


// Function to extract coordinates from GeoLocation field if present
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


// Function to geocode location names (e.g., cities) to get coordinates
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


// Main preprocess function
const preprocessData = async (data, setProgress) => {
 // Initialize progress
 setProgress((prev) => ({ ...prev, preprocess: 0 }));


 const limitedData = data.slice(0, 100000); // Limit data to 100,000 rows


 setProgress((prev) => ({ ...prev, preprocess: 10 }));


 // Define possible column names for latitude and longitude
 const possibleLatitudeFields = ['latitude', 'Latitude', 'lat', 'Lat', 'LATITUDE', 'LAT'];
 const possibleLongitudeFields = ['longitude', 'Longitude', 'lon', 'Lng', 'Long', 'LONGITUDE', 'LNG', 'LON'];


 // Define possible location fields
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


 // Map dataset columns to standard names
 const firstRow = limitedData[0];


 // Map latitude field
 let latitudeField = possibleLatitudeFields.find((field) => field in firstRow);
 // Map longitude field
 let longitudeField = possibleLongitudeFields.find((field) => field in firstRow);
 // Map location field
 let locationField = possibleLocationFields.find((field) => field in firstRow);


 if (!latitudeField || !longitudeField) {
   // If latitude and longitude are not available, we need a location field
   if (!locationField) {
     alert('No valid location information found in the dataset.');
     return [];
   }
 }


 setProgress((prev) => ({ ...prev, preprocess: 20 }));


 const requiredFields = [];
 if (!latitudeField || !longitudeField) {
   requiredFields.push(locationField);
 }


 const cleanData = limitedData.filter((row) => {
   return requiredFields.every(
     (field) =>
       row.hasOwnProperty(field) &&
       row[field] !== null &&
       row[field] !== undefined &&
       row[field].toString().trim() !== ''
   );
 });


 if (cleanData.length === 0) {
   alert('No data available after filtering out rows with missing critical fields.');
   return [];
 }


 setProgress((prev) => ({ ...prev, preprocess: 30 }));


 const dataWithCoords = await Promise.all(
   cleanData.map(async (item) => {
     let latitude = null;
     let longitude = null;
     let locationName = '';


     if (latitudeField && longitudeField) {
       latitude = parseFloat(item[latitudeField]);
       longitude = parseFloat(item[longitudeField]);
     } else if (item.GeoLocation) {
       const coords = extractCoordinates(item.GeoLocation);
       latitude = coords.latitude;
       longitude = coords.longitude;
     } else if (item[locationField]) {
       // Geocode if we have a location name
       locationName = item[locationField];
       const coords = await geocodeLocation(locationName);
       latitude = coords.latitude;
       longitude = coords.longitude;
     }


     // Remove any existing latitude and longitude fields to avoid confusion
     possibleLatitudeFields.forEach((field) => {
       delete item[field];
     });
     possibleLongitudeFields.forEach((field) => {
       delete item[field];
     });


     return { ...item, latitude, longitude };
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
   alert('No data available after extracting coordinates.');
   return [];
 }


 setProgress((prev) => ({ ...prev, preprocess: 90 }));


 setProgress((prev) => ({ ...prev, preprocess: 100 }));


 return cleanDataWithCoords;
};


export default preprocessData;



