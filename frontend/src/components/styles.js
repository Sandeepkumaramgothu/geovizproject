const styles = {
  container: {
    display: 'flex',
    height: '100vh',
  },
  map: {
    width: '65%',
    height: '100vh',
  },
  sidebar: {
    width: '45%',
    padding: '5px',
    overflowY: 'auto',
    backgroundColor: '#f7f9fc',
    borderLeft: '2px solid #ddd',
  },
  combinedBox: {
    marginBottom: '10px',
  },
  progressContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginBottom: '10px',
  },
  progressItem: {
    marginBottom: '10px',
  },
  progressMessage: {
    marginTop: '5px',
    fontSize: '14px',
    textAlign: 'center',
    color: '#555',
  },
  section: {
    marginBottom: '5px',
    padding: '2px',
    backgroundColor: '#fff',
    borderRadius: '3px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    fontSize: '12px',
    borderRadius: '2px',
  },
  datasetDetails: {
    fontSize: '12px',
    color: '#666',
  },
  inputGroup: {
    marginBottom: '5px',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '12px',
    color: '#555',
  },
  selectDropdown: {
    width: '100%',
    padding: '8px',
    fontSize: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  chartOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '5px',
  },
  chartButton: {
    flex: '1 1 calc(50% - 10px)',
    padding: '5px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: '4px',
  },
  chartButtonActive: {
    backgroundColor: '#0056b3',
  },
  chartContainer: {
    marginTop: '20px',
  },
  chartWrapper: {
    position: 'relative',
    width: '100%',
    height: '300px',
  },
  chartContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
};

export default styles;
