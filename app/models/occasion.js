import DS from 'ember-data';

export default DS.Model.extend({
  date: DS.attr('date'),
  territory: DS.attr('string'),
  wikidata: DS.attr('string'),
  extradata: DS.attr(),
  num: DS.attr('number'),
  title: DS.attr('string')
});
