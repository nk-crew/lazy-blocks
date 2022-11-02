import getControlTypeData from '../../../../utils/get-control-type-data';
import ProNotice from '../../../../components/pro-notice';

import LabelRow from './label';
import NameRow from './name';
import TypeRow from './type';
import RequiredRow from './required';
import ControlSpecificRows from './control-specific-rows';
import DefaultRow from './default';
import HelpRow from './help';
import PlacementRow from './placement';
import WidthRow from './width';
import HideIfNotSelectedRow from './hide-if-not-selected';
import SaveInMetaRow from './save-in-meta';

const { applyFilters } = wp.hooks;

export default function settingsRows(props) {
  const { data, id } = props;

  const controlTypeData = getControlTypeData(data.type);

  const rows = applyFilters(
    'lzb.constructor.control.settings-rows',
    {
      label: LabelRow,
      name: NameRow,
      type: TypeRow,
      control_specific_rows: ControlSpecificRows,
      default: DefaultRow,
      help: HelpRow,
      placement: PlacementRow,
      width: WidthRow,
      required: RequiredRow,
      hide_if_not_selected: HideIfNotSelectedRow,
      save_in_meta: SaveInMetaRow,
      pro_notice: ProNotice,
    },
    props,
    controlTypeData
  );

  return Object.keys(rows).map((i) => {
    const Row = rows[i];
    let allow = true;

    // check restrictions.
    if (controlTypeData && 'undefined' !== typeof controlTypeData.restrictions[`${i}_settings`]) {
      allow = controlTypeData.restrictions[`${i}_settings`];
    }

    // conditions to show rows.
    switch (i) {
      case 'placement':
      case 'save_in_meta':
        allow = allow && !data.child_of;
        break;
      case 'width':
      case 'hide_if_not_selected':
        allow = !data.placement || 'content' === data.placement || 'both' === data.placement;
        break;
      // no default
    }

    // don't show.
    if (!allow) {
      return null;
    }

    return <Row key={`settings-row-${id}-${i}`} controlTypeData={controlTypeData} {...props} />;
  });
}
