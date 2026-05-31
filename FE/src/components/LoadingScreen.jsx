import React from 'react';
import logo from '../assets/logo.png'; 
const LoadingScreen = () => {
  return (
    <div style={styles.container}>
      <img src={logo} alt="Renewaa Logo" style={styles.logo} />
      <div style={styles.loaderBar}></div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: '150px',
    animation: 'pulse 2s infinite ease-in-out',
  },
  loaderBar: {
    marginTop: '20px',
    width: '100px',
    height: '4px',
    backgroundColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
  }
};

export default LoadingScreen;