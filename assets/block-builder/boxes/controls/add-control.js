/**
 * WordPress dependencies.
 */
import { Button, Dropdown, Path, SVG } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';
import { getNewControlData, markNewControl } from './control-types';
import ControlTypePicker from './type-picker';

export const plusIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" />
	</SVG>
);

const QUICK_TYPES = ['text', 'image', 'repeater'];

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
 * "Add control" button with the control type picker.
 *
 * @param {Object} props
 * @param {string} props.placement Placement of the new control.
 * @param {string} props.childOf   Parent repeater id for child controls.
 * @param {string} props.label     Button text.
 * @param {string} props.variant   Button variant.
 * @param {Object} props.icon      Button icon.
 */
export default function AddControl({
	placement = 'content',
	childOf = '',
	label = __('Add control', 'lazy-blocks'),
	variant = 'secondary',
	icon = plusIcon,
}) {
	const addControl = useAddControl();

	return (
		<Dropdown
			className="lzb-block-builder-controls-add"
			contentClassName="lzb-control-type-picker-popover"
			popoverProps={{ placement: 'bottom-start' }}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					className="lzb-block-builder-controls-item-appender"
					variant={variant}
					size="compact"
					icon={icon}
					onClick={onToggle}
					aria-expanded={isOpen}
					aria-haspopup="true"
				>
					{label}
				</Button>
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
 * Placeholder of an empty controls list with the most common types.
 *
 * @param {Object} props
 * @param {string} props.placement Placement of the list.
 */
export function ControlsEmptyState({ placement }) {
	const addControl = useAddControl();

	let title = __('No content controls yet', 'lazy-blocks');
	let description = __(
		'Content controls appear inside the block in the editor.',
		'lazy-blocks'
	);

	if (placement === 'inspector') {
		title = __('No inspector controls yet', 'lazy-blocks');
		description = __(
			'Inspector controls appear in the block settings sidebar.',
			'lazy-blocks'
		);
	} else if (placement === 'nowhere') {
		title = __('No hidden controls', 'lazy-blocks');
		description = __(
			'Hidden controls store a value without showing a field.',
			'lazy-blocks'
		);
	}

	return (
		<div className="lzb-block-builder-controls-empty">
			<p className="lzb-block-builder-controls-empty-title">{title}</p>
			<p className="lzb-block-builder-controls-empty-description">
				{description}
			</p>
			<div className="lzb-block-builder-controls-empty-actions">
				{QUICK_TYPES.map((type) => {
					const controlTypeData = getControlTypeData(type);

					if (!controlTypeData || controlTypeData.name !== type) {
						return null;
					}

					return (
						<Button
							key={type}
							variant="secondary"
							size="compact"
							icon={
								<span
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={{
										__html: controlTypeData.icon,
									}}
								/>
							}
							onClick={() => addControl(type, { placement })}
						>
							{controlTypeData.label}
						</Button>
					);
				})}
				<AddControl
					placement={placement}
					label={__('Browse all', 'lazy-blocks')}
					variant="tertiary"
					icon={null}
				/>
			</div>
		</div>
	);
}
