import React, { useState, useEffect } from 'react';

const FilterControls = ({ onFilterChange, properties, geoData }) => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [values, setValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  useEffect(() => {
    if (selectedProperty) {
      const uniqueValues = [...new Set(
        geoData.features.map((feature) => feature.properties[selectedProperty])
      )];
      setValues(uniqueValues);
    } else {
      setValues([]);
    }
    setSelectedValue('');
  }, [selectedProperty, geoData]);

  const handlePropertyChange = (event) => {
    setSelectedProperty(event.target.value);
    onFilterChange(event.target.value, '');
  };

  const handleValueChange = (event) => {
    setSelectedValue(event.target.value);
    onFilterChange(selectedProperty, event.target.value);
  };

  return (
    <div style={{ margin: '20px' }}>
      <label>Filter by Property: </label>
      <select value={selectedProperty} onChange={handlePropertyChange}>
        <option value="">Select Property</option>
        {properties.map((prop, index) => (
          <option key={index} value={prop}>{prop}</option>
        ))}
      </select>

      {values.length > 0 && (
        <>
          <label> Filter by Value: </label>
          <select value={selectedValue} onChange={handleValueChange}>
            <option value="">All</option>
            {values.map((val, index) => (
              <option key={index} value={val}>{val}</option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default FilterControls;
