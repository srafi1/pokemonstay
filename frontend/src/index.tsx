import React from 'react';
import ReactDOM from 'react-dom';

import { Redirect, Route, BrowserRouter as Router } from 'react-router-dom';
import 'typeface-roboto';
import './index.css';

import Unauthenticated from './components/Unauthenticated';
import Authenticated from './components/Authenticated';
import Home from './components/Home';
import Login from './components/Login';
import Logout from './components/Logout';
import Map from './components/Map';
import Register from './components/Register';
import Profile from './components/Profile';
import Pokemon from './components/Pokemon';
import Pokedex from './components/Pokedex';

const router = (
  <Router>
    <Route exact path="/"
      render={() => <Unauthenticated component={Home} />} />
    <Route exact path="/login"
      render={() => <Unauthenticated component={Login} />} />
    <Route exact path="/register"
      render={() => <Unauthenticated component={Register} />} />
    <Route exact path="/logout" component={Logout} />
    <Route exact path="/map"
      render={() => <Authenticated component={Map} />} />
    <Route exact path="/profile"
      render={() => <Authenticated component={Profile} />} />
    <Route exact path="/pokemon"
      render={() => <Authenticated component={Pokemon} />} />
    <Route exact path="/pokedex"
      render={() => <Authenticated component={Pokedex} />} />

    <Route path="/*"
      render={() => <Redirect to="/" />} />
  </Router>
)

ReactDOM.render(router, document.getElementById('root'));
