import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('occasions', function() {
    this.route('show', { path: '/:occasion_id' });
  });
  this.route('uber');
});

export default Router;
