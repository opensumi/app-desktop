import React from 'react';
import { HashRouter as Router, Route, Redirect, Switch } from 'react-router-dom';

import { pageRender } from 'base/browser/bootstrap.view';
import { Dialog } from 'base/browser/components/dialog';

import { HomePage } from './views/home';

import './app.less';

pageRender(
  <Dialog title="Dashboard" titleHidden>
    <Router>
      <Switch>
        <Route path="/home" exact component={HomePage} />
      </Switch>
      <Route path="/" exact render={() => <Redirect to="/home" />} />
    </Router>
  </Dialog>,
);
