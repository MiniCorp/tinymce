import DomState from '../alien/DomState';
import Dragging from '../api/behaviour/Dragging';
import Pinching from '../api/behaviour/Pinching';
import Toggling from '../api/behaviour/Toggling';
import CompBehaviours from '../api/component/CompBehaviours';
import BehaviourBlob from '../behaviour/common/BehaviourBlob';
import ComponentEvents from '../construct/ComponentEvents';
import { FieldSchema } from '@ephox/boulder';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';



export default <any> function () {
  var getEvents = function (elem, spec) {
    var evts = DomState.getOrCreate(elem, function () {
      // If we haven't already setup this particular element, then generate any state and config
      // required by its behaviours and put it in the cache.
      var info = ValueSchema.asStructOrDie('foreign.cache.configuration', ValueSchema.objOfOnly([
        FieldSchema.defaulted('events', { }),
        FieldSchema.optionObjOf('behaviours', [
          // NOTE: Note all behaviours are supported at the moment
          Toggling.schema(),
          Dragging.schema(),
          Pinching.schema()
        ]),
        FieldSchema.defaulted('eventOrder', {})

      ]), Objects.narrow(spec, [ 'events', 'eventOrder' ]));

      var bInfo = CompBehaviours.generateFrom(spec, [ Toggling, Dragging, Pinching ]);

      var baseEvents = {
        'alloy.base.behaviour': info.events()
      };

      var bData = BehaviourBlob.getData(bInfo);
      return ComponentEvents.combine(bData, info.eventOrder(), [ Toggling, Dragging, Pinching ], baseEvents).getOrDie();
    });

    return {
      elem: Fun.constant(elem),
      evts: Fun.constant(evts)
    };
  };

  return {
    getEvents: getEvents
  };
};