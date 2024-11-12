

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
  },
  leftContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '65%', // Adjust as needed
  },
  topLeftContainer: {
    display: 'flex',
    flexDirection: 'row',
    padding: '10px',
    backgroundColor: '#f7f9fc',
    borderBottom: '2px solid #ddd',
    alignItems: 'stretch', // Ensure children stretch to same height
  },
  uploadContainer: {
    flex: '1',
    marginRight: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  datasetContainer: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
  },
  progressContainer: {
    padding: '10px',
    backgroundColor: '#f7f9fc',
    borderBottom: '2px solid #ddd',
  },
  buttonContainer: {
    padding: '10px',
    backgroundColor: '#f7f9fc',
    borderBottom: '2px solid #ddd',
  },
  mapContainer: {
    flex: '1',
    display: 'flex',
  },
  map: {
    flex: '1',
    height: '100%',
  },
  sidebar: {
    width: '35%',
    padding: '5px',
    overflowY: 'auto',
    backgroundColor: '#f7f9fc',
    borderLeft: '2px solid #ddd',
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
    flex: '1', // Make sections fill the available height
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '0', // Remove bottom margin to align heights
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '3px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  fileInput: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '2px',
  },
  datasetDetails: {
    fontSize: '14px',
    color: '#666',
    flex: '1',
  },
  inputGroup: {
    marginBottom: '5px',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555',
  },
  selectDropdown: {
    width: '100%',
    padding: '8px',
    fontSize: '14px',
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
    backgroundColor: '#386994',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: '4px',
  },
  chartButtonActive: {
    backgroundColor: '#214457',
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
