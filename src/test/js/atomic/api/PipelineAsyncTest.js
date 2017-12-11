import Pipeline from 'ephox/agar/api/Pipeline';
import RawAssertions from 'ephox/agar/api/RawAssertions';
import Step from 'ephox/agar/api/Step';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('PipelineSuite Test', function() {
  var success = arguments[arguments.length-2];
  var failure = arguments[arguments.length-1];

  var mutator = function (property, value) {
    return Step.stateful(function (state, next, die) {
      state[property] = value;
      setTimeout(function () {
        next(state);
      }, 10);
    });
  };

  Pipeline.async({}, [
    mutator('name', 'testfile'),
    mutator('purpose', 'unknown'),
    mutator('correctness', 'tbd')
  ], function (result) { 
    RawAssertions.assertEq('Should have all state properties', {
      name: 'testfile',
      purpose: 'unknown',
      correctness: 'tbd'
    }, result);
    success();

  }, failure);
});

