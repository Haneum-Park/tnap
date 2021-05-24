import React from 'react';
import { Link } from 'react-router-dom';

import '../../stylesheets/Common/index.css';

const { ipcRenderer } = window;

class Headers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleNavIcon = this.handleNavIcon.bind(this);
    this.handleCloseNavLinks = this.handleCloseNavLinks.bind(this);
    this.handleInfoDelete = this.handleInfoDelete.bind(this);
  };

  componentDidMount() {
    console.log('Headers');
  };

  handleNavIcon() {
    document.querySelector('nav').classList.toggle('show');
  };

  handleCloseNavLinks() {
    document.querySelector('nav').classList.toggle('show');
  };

  handleInfoDelete() {
    ipcRenderer.send('request_userinfo_data_store_data', {});
    localStorage.clear();
  };

  render() {
    return (
      <nav>
        <div className="nav-content">
          <Link to="/" className="logo">
            <svg width="18" height="44" display="block">
                <circle cx="9" cy="22" r="8" stroke="white" strokeWidth="1.5" fill="white" />
            </svg>
          </Link>
          
          <div className="nav-icon" onClick={this.handleNavIcon}>
            <div className="bar one"></div>
            <div className="bar two"></div>
          </div>

          <div className="nav-links" onClick={this.handleCloseNavLinks}>
            <Link to="/" replace>Home</Link>
            <Link to="/status" replace>Status</Link>
            <Link to="/settings" replace>Settings</Link>
            <button className="deleteBtn" type="button" onClick={this.handleInfoDelete}>정보 삭제</button>
          </div>

          {/* <svg className="search-icon" viewBox="0 0 3.7041668 11.641667" height="44" width="14">
            <g transform="matrix(0.97865947,0,0,0.97865947,-18.209185,-74.390797)">
              <path d="m 19.070369,80.532362 c -0.618144,0.618143 -0.619255,1.62581 -7.32e-4,2.244333 0.570867,0.570865 1.473777,0.613735 2.095614,0.131181 l 0.945308,0.945309 0.280633,-0.280633 -0.945308,-0.945309 c 0.482552,-0.621838 0.439684,-1.524746 -0.131182,-2.095613 -0.618523,-0.618523 -1.62619,-0.617413 -2.244333,7.32e-4 z m 0.280632,0.280632 c 0.466517,-0.466515 1.216631,-0.467898 1.683433,-0.0011 0.466802,0.466801 0.466882,1.218378 3.64e-4,1.684894 -0.466512,0.466513 -1.21809,0.466436 -1.684892,-3.67e-4 -0.466803,-0.466801 -0.465418,-1.216918 0.0011,-1.683432 z" fill="white" />
            </g>
          </svg> */}
        </div>
      </nav>
    );
  };
};

export default Headers;