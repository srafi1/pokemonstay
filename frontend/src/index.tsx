import React from 'react';
import ReactDOM from 'react-dom';

import { Route, BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import './index.css';

import Home from './components/Home';
import Login from './components/Login';

const router = (
  <Router>
    <Route exact path="/" component={Home} />
    <Route path="/login" component={Login} />
  </Router>
)

ReactDOM.render(router, document.getElementById('root'));
