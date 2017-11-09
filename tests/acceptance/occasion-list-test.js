import { test } from 'qunit';
import moduleForAcceptance from 'wahlometer/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | occasion list');

test('should show list of occasions', assert => {
  visit('/occasions');
  andThen(() => {
    assert.equal(find('.occasion_listing').length > 10, true,
      'should see multiple listings')
  });
});

test('should show occasions as the home page', function (assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/occasions',
      'should redirect automatically');
  });
});

test('should filter the list of occasions by territory', function(assert) {
  visit('/occasions');
  fillIn('.list-filter input', 'Hamburg');
  keyEvent('.list-filter input', 'keyup', 69);
  andThen(function() {
    assert.equal(find('.occasion_listing').length, 3,
      "Datensatz enthält drei Wahlen in Hamburg");
  })
});

test('clicking an occasion loads its details', function(assert) {
  visit('/occasions');
  click('a:contains("Europawahl 2004")');
  andThen(function() {
    assert.equal(currentURL(), '/occasions/3', 'should navigate to show route');
    assert.equal(find('.title').text(), "Europawahl 2004", "Occasion #3 page should have this title");
    assert.equal(find('.owner').text().trim(), "Territorium: europa", "Occasion #3 page should have this territory");
  })
})
