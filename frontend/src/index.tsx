import React from 'react';
import ReactDOM from 'react-dom';

import Home from './components/Home';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import './index.css';

const router = (
  <Router>
    <Route exact path="/" component={Home} />
  </Router>
)

ReactDOM.render(router, document.getElementById('root'));
