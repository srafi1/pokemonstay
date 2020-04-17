import React from 'react';
import ReactDOM from 'react-dom';

import { Route, BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import './index.css';

import Home from './components/Home';
import Login from './components/Login';
import Logout from './components/Logout';
import Map from './components/Map';
import Register from './components/Register';
import Unauthenticated from './components/Unauthenticated';

const router = (
  <Router>
    <Route exact path="/"
      render={() => <Unauthenticated component={Home} />} />
    <Route exact path="/login"
      render={() => <Unauthenticated component={Login} />} />
    <Route exact path="/register"
      render={() => <Unauthenticated component={Register} />} />
    <Route exact path="/logout" component={Logout} />
    <Route exact path="/map" component={Map} />
  </Router>
)

ReactDOM.render(router, document.getElementById('root'));
