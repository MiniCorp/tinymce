import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Positioning from 'ephox/alloy/api/behaviour/Positioning';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';

var make = function () {
  return GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Positioning.config({
          useFixed: true
        })
      ])
    })
  );
};

export default <any> {
  make: make
};