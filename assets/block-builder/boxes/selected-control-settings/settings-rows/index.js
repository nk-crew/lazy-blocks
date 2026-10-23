/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../../utils/get-control-type-data';
import ControlSpecificRows from './control-specific-rows';
import DefaultRow from './default';
import GroupRow from './group';
import HelpRow from './help';
import HideIfNotSelectedRow from './hide-if-not-selected';
import LabelRow from './label';
import NameRow from './name';
import PlacementRow from './placement';
import RequiredRow from './required';
import SaveInMetaRow from './save-in-meta';
import TranslateRow from './translate';
import TypeRow from './type';
import WidthRow from './width';

// Rows of the Layout and Behavior groups. Any other row, including rows added
// through the filter, goes to the Settings group.
const LAYOUT_ROWS = ['placement', 'width', 'group'];
const BEHAVIOR_ROWS = [
	'required',
	'hide_if_not_selected',
	'translate',
	'save_in_meta',
];

/**
 * Settings rows of a control, split into the Settings, Layout and Behavior
 * groups.
 *
 * @param {Object} props Row props: data, id, updateData.
 *
 * @return {Object} Rows per group as [key, Component] pairs, and the type row.
 */
export default function getSettingsRows(props) {
	const { data } = props;

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
			group: GroupRow,
			width: WidthRow,
			required: RequiredRow,
			hide_if_not_selected: HideIfNotSelectedRow,
			translate: TranslateRow,
			save_in_meta: SaveInMetaRow,
		},
		props,
		controlTypeData
	);

	const result = {
		type: null,
		settings: [],
		layout: [],
		behavior: [],
	};

	Object.keys(rows).forEach((i) => {
		let allow = true;

		// check restrictions.
		if (
			controlTypeData &&
			typeof controlTypeData.restrictions[`${i}_settings`] !== 'undefined'
		) {
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
				allow =
					!data.placement ||
					data.placement === 'content' ||
					data.placement === 'both';
				break;
			case 'group':
				allow =
					!data.placement ||
					data.placement === 'inspector' ||
					data.placement === 'both';
				break;
			// no default
		}

		// don't show.
		if (!allow || !rows[i]) {
			return;
		}

		// The control header shows the default type row.
		if (i === 'type' && rows[i] === TypeRow) {
			result.type = rows[i];
		} else if (LAYOUT_ROWS.includes(i)) {
			result.layout.push([i, rows[i]]);
		} else if (BEHAVIOR_ROWS.includes(i)) {
			result.behavior.push([i, rows[i]]);
		} else {
			result.settings.push([i, rows[i]]);
		}
	});

	return result;
}
