// src/components/styles.js

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    backgroundColor: '#f0f2f5',
    '@media (max-width: 768px)': {
      flexDirection: 'column',
    },
  },
  map: {
    flex: 1,
    height: '100%',
    border: '2px solid #ddd',
    borderRadius: '8px',
    margin: '10px',
    '@media (max-width: 768px)': {
      height: '50vh',
    },
  },
  sidebar: {
    flex: 1,
    padding: '20px',
    backgroundColor: '#fff',
    borderLeft: '2px solid #ddd',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    '@media (max-width: 768px)': {
      borderLeft: 'none',
      borderTop: '2px solid #ddd',
      height: '50vh',
    },
  },
  combinedBox: {
    padding: '15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  section: {
    marginBottom: '10px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  chartContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  chartWrapper: {
    width: '500px',       // Set width to a fixed value
    height: '500px',      // Set height to the same fixed value
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    margin: '0 auto',     // Center the chart horizontally
    position: 'relative', // For positioning chart content
  },
  chartContent: {
    position: 'absolute',
    top: '10px',    // Adjust for padding if needed
    left: '10px',   // Adjust for padding if needed
    right: '10px',  // Adjust for padding if needed
    bottom: '10px', // Adjust for padding if needed
  },
  fileInput: {
    padding: '10px',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  datasetDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    color: '#555',
  },
  chartOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
  },
  chartButton: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderRadius: '5px',
    border: '1px solid #ddd',
    backgroundColor: '#007BFF',
    color: '#fff',
    transition: 'background-color 0.3s ease',
    fontWeight: 'bold',
  },
  chartButtonActive: {
    backgroundColor: '#0056b3',
  },
  progressContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
  },
  progressItem: {
    width: '80px',
    height: '80px',
    textAlign: 'center',
  },
  progressMessage: {
    marginTop: '5px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '10px',
  },
  inputLabel: {
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  selectDropdown: {
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    width: '100%',
  },
};

export default styles;
