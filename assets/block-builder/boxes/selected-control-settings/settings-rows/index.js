/**
 * WordPress dependencies.
 */
import { applyFilters } from '@wordpress/hooks';
import ProNotice from '../../../../components/pro-notice';
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
			group: GroupRow,
			width: WidthRow,
			required: RequiredRow,
			hide_if_not_selected: HideIfNotSelectedRow,
			translate: TranslateRow,
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
		if (!allow) {
			return null;
		}

		return (
			<Row
				key={`settings-row-${id}-${i}`}
				controlTypeData={controlTypeData}
				{...props}
			/>
		);
	});
}
