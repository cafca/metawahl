import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    filterByTerritory(param) {
      return this.get('store').query('occasion', {territory: param});
    }
  }
});
