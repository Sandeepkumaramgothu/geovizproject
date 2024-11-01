

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },













  
  map: {
    flex: 3,
    height: '100%',
    border: '2px solid #ddd',
    borderRadius: '8px',
    margin: '10px',
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
  },
  section: {
    padding: '15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
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
  locationInfo: {
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
  chartContainer: {
    width: '100%',
    height: '300px',
    marginTop: '10px',
    padding: '10px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
};

export default styles;
