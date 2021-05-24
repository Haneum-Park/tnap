import React from 'react';
import Routes from './Routes';

import '../stylesheets/Layout/index.css';

class App extends React.Component{
  render () {
    return (
      <div className="App">
        <Routes />
      </div>
    );
  }
}

export default App;
