import React from 'react';
import ReactDOM from 'react-dom';

import { Route, BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import './index.css';

import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';

const router = (
  <Router>
    <Route exact path="/" component={Home} />
    <Route exact path="/login" component={Login} />
    <Route exact path="/register" component={Register} />
  </Router>
)

ReactDOM.render(router, document.getElementById('root'));
