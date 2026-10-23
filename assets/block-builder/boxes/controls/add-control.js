/**
 * WordPress dependencies.
 */
import { Button, Dropdown, Path, SVG } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { getNewControlData, markNewControl } from './control-types';
import ControlTypePicker from './type-picker';

export const plusIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" />
	</SVG>
);

/**
 * Returns a function that adds a control of a type, selects it and moves the
 * focus to its label in the Control tab.
 *
 * @return {Function} Callback taking the type name and extra control data.
 */
export function useAddControl() {
	const controls = useSelect(
		(select) =>
			select('lazy-blocks/block-data').getBlockData()?.controls || {},
		[]
	);
	const { addControl } = useDispatch('lazy-blocks/block-data');
	const { getSelectedControlId } = useSelect(
		(select) => select('lazy-blocks/block-data'),
		[]
	);

	return (type, extra) => {
		// The reducer selects the new control, which opens the Control tab.
		addControl(getNewControlData(type, controls, extra));
		markNewControl(getSelectedControlId());

		// After the popover has closed and returned the focus to its toggle.
		setTimeout(() => {
			const input = document.getElementById(
				'lazyblocks-settings-row-label'
			);

			if (input) {
				input.focus();
				input.select();
			}
		});
	};
}

/**
 * "Add control" button with the control type picker, a black "+" like the
 * block appender of the editor.
 *
 * @param {Object} props
 * @param {string} props.placement Placement of the new control.
 * @param {string} props.childOf   Parent repeater id for child controls.
 * @param {string} props.label     Button label.
 */
export default function AddControl({
	placement = 'content',
	childOf = '',
	label = __('Add control', 'lazy-blocks'),
}) {
	const addControl = useAddControl();

	return (
		<Dropdown
			className="lzb-block-builder-controls-add"
			contentClassName="lzb-control-type-picker-popover block-editor-inserter__popover is-quick"
			popoverProps={{ placement: 'bottom-start' }}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					className="lzb-block-builder-controls-item-appender"
					icon={plusIcon}
					label={label}
					showTooltip
					onClick={onToggle}
					aria-expanded={isOpen}
					aria-haspopup="true"
				/>
			)}
			renderContent={({ onClose }) => (
				<ControlTypePicker
					data={{ placement, child_of: childOf }}
					onPick={(type) => {
						onClose();
						addControl(type, {
							placement,
							child_of: childOf,
						});
					}}
				/>
			)}
		/>
	);
}

/**
 * Placeholder of an empty controls list.
 *
 * @param {Object} props
 * @param {string} props.placement Placement of the list.
 */
export function ControlsEmptyState({ placement }) {
	return (
		<div className="lzb-block-builder-controls-empty">
			<AddControl placement={placement} />
		</div>
	);
}
