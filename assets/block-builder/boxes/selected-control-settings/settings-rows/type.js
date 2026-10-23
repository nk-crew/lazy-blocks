/**
 * WordPress dependencies.
 */
import { Button, Dropdown, Path, SVG } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../../utils/get-control-type-data';
import ControlTypePicker from '../../controls/type-picker';

const chevronDown = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M17.5 11.6L12 16l-5.5-4.4.9-1.2L12 14l4.5-3.6 1 1.2z" />
	</SVG>
);

/**
 * Type of the selected control, with a button that opens the type picker.
 *
 * @param {Object} props
 */
export default function TypeRow(props) {
	const { updateData, data } = props;
	const { type = '' } = data;

	const parentLabel = useSelect(
		(select) => {
			if (!data.child_of) {
				return '';
			}

			const parent = select('lazy-blocks/block-data').getBlockData()
				?.controls?.[data.child_of];

			return parent?.label || '';
		},
		[data.child_of]
	);

	const controlTypeData = getControlTypeData(type);

	let text = controlTypeData.label;
	if (parentLabel) {
		text = sprintf(
			// translators: 1: control type, 2: parent repeater label.
			__('%1$s in %2$s', 'lazy-blocks'),
			controlTypeData.label,
			parentLabel
		);
	}

	return (
		<Dropdown
			className="lzb-block-builder-control-type"
			contentClassName="lzb-control-type-picker-popover block-editor-inserter__popover is-quick"
			popoverProps={{ placement: 'left-start', offset: 36 }}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					id="lazyblocks-settings-row-type"
					className="lzb-block-builder-control-type-toggle"
					size="small"
					onClick={onToggle}
					aria-expanded={isOpen}
					aria-haspopup="true"
					aria-label={sprintf(
						// translators: %s: control type.
						__('Change type: %s', 'lazy-blocks'),
						text
					)}
				>
					{text}
					{chevronDown}
				</Button>
			)}
			renderContent={({ onClose }) => (
				<ControlTypePicker
					data={data}
					current={type}
					onPick={(newType) => {
						updateData({ type: newType });
						onClose();
					}}
				/>
			)}
		/>
	);
}
