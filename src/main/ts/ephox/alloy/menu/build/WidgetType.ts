import EditableFields from '../../alien/EditableFields';
import Behaviour from '../../api/behaviour/Behaviour';
import Focusing from '../../api/behaviour/Focusing';
import Keying from '../../api/behaviour/Keying';
import Representing from '../../api/behaviour/Representing';
import AlloyEvents from '../../api/events/AlloyEvents';
import NativeEvents from '../../api/events/NativeEvents';
import SystemEvents from '../../api/events/SystemEvents';
import Fields from '../../data/Fields';
import WidgetParts from './WidgetParts';
import ItemEvents from '../util/ItemEvents';
import AlloyParts from '../../parts/AlloyParts';
import { FieldSchema } from '@ephox/boulder';
import { Merger } from '@ephox/katamari';
import { Option } from '@ephox/katamari';

var builder = function (info) {
  var subs = AlloyParts.substitutes(WidgetParts.owner(), info, WidgetParts.parts());
  var components = AlloyParts.components(WidgetParts.owner(), info, subs.internals());

  var focusWidget = function (component) {
    return AlloyParts.getPart(component, info, 'widget').map(function (widget) {
      Keying.focusIn(widget);
      return widget;
    });
  };

  var onHorizontalArrow = function (component, simulatedEvent) {
    return EditableFields.inside(simulatedEvent.event().target()) ? Option.none() : (function () {
      if (info.autofocus()) {
        simulatedEvent.setSource(component.element());
        return Option.none();
      } else {
        return Option.none();
      }
    })();
  };

  return Merger.deepMerge({
    dom: info.dom(),
    components: components,
    domModification: info.domModification(),
    events: AlloyEvents.derive([
      AlloyEvents.runOnExecute(function (component, simulatedEvent) {
        focusWidget(component).each(function (widget) {
          simulatedEvent.stop();
        });
      }),

      AlloyEvents.run(NativeEvents.mouseover(), ItemEvents.onHover),

      AlloyEvents.run(SystemEvents.focusItem(), function (component, simulatedEvent) {
        if (info.autofocus()) focusWidget(component);
        else Focusing.focus(component);
      })
    ]),
    behaviours: Behaviour.derive([
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: info.data()
        }
      }),
      Focusing.config({
        onFocus: function (component) {
          ItemEvents.onFocus(component);
        }
      }),
      Keying.config({
        mode: 'special',
        // focusIn: info.autofocus() ? function (component) {
        //   focusWidget(component);
        // } : Behaviour.revoke(),
        onLeft: onHorizontalArrow,
        onRight: onHorizontalArrow,
        onEscape: function (component, simulatedEvent) {
          // If the outer list item didn't have focus,
          // then focus it (i.e. escape the inner widget). Only do if not autofocusing
          // Autofocusing should treat the widget like it is the only item, so it should
          // let its outer menu handle escape
          if (! Focusing.isFocused(component) && !info.autofocus()) {
            Focusing.focus(component);
            return Option.some(true);
          } else if (info.autofocus()) {
            simulatedEvent.setSource(component.element());
            return Option.none();
          } else {
            return Option.none();
          }
        }
      })
    ])
  });
};

var schema = [
  FieldSchema.strict('uid'),
  FieldSchema.strict('data'),
  FieldSchema.strict('components'),
  FieldSchema.strict('dom'),
  FieldSchema.defaulted('autofocus', false),
  FieldSchema.defaulted('domModification', { }),
  // We don't have the uid at this point
  AlloyParts.defaultUidsSchema(WidgetParts.parts()),
  Fields.output('builder', builder)
];

export default <any> schema;