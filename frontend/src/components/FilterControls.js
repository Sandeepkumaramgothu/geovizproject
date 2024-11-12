import React, { useState, useEffect } from 'react';
const FilterControls = ({ onFilterChange, properties, geoData }) => {
  const [selectedProperty, setSelectedProperty] = useState('');
  const [values, setValues] = useState([]);
  const [selectedValue, setSelectedValue] = useState('');

  // Update the list of unique values whenever the selected property or geoData changes
  useEffect(() => {
    if (selectedProperty) {
      const uniqueValues = [
        ...new Set(geoData.map((item) => item[selectedProperty]).filter(Boolean)),
      ];
      setValues(uniqueValues);
    } else {
      setValues([]);
    }
    setSelectedValue('');
  }, [selectedProperty, geoData]);

  // Handle changes to the selected property
  const handlePropertyChange = (event) => {
    const property = event.target.value;
    setSelectedProperty(property);
    onFilterChange(property, '');
  };

  // Handle changes to the selected value
  const handleValueChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    onFilterChange(selectedProperty, value);
  };

  return (
    <div style={{ margin: '20px' }}>
      <label>Filter by Property: </label>
      <select value={selectedProperty} onChange={handlePropertyChange}>
        <option value="">Select Property</option>
        {properties.map((prop) => (
          <option key={prop} value={prop}>
            {prop}
          </option>
        ))}
      </select>

      {values.length > 0 && (
        <>
          <label> Filter by Value: </label>
          <select value={selectedValue} onChange={handleValueChange}>
            <option value="">All</option>
            {values.map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default FilterControls;
