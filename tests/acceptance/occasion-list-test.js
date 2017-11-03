import { test } from 'qunit';
import moduleForAcceptance from 'wahlometer/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | occasion list');

test('should show list of occasions', assert => {
  visit('/occasions');
  andThen(() => {
    assert.equal(find('.occasion_listing').length > 10, true, 'should see multiple listings')
  })
});

test('should show occasions as the home page', function (assert) {
  visit('/');
  andThen(function() {
    assert.equal(currentURL(), '/occasions', 'should redirect automatically');
  });
});
