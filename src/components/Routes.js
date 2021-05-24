import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import Headers from './Common/Headers';
import Main from 'components/Main/index.js';
import Settings from 'components/Settings/index.js';
import Status from 'components/Status/index.js';

export default () => (
  <Router>
    <Headers />
    <Route exact path="/" component={Main} />
    <Route exact path="/status" component={Status} />
    <Route exact path="/settings" component={Settings} />
  </Router>
);
