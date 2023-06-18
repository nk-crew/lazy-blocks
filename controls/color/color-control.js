/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies.
 */
import { Dropdown, Button } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import ColorPalette from './color-palette';

function ColorControl(props) {
	const {
		value,
		label = '',
		alpha = false,
		palette = true,
		onChange = () => {},
	} = props;

	return (
		<Dropdown
			className="lazyblocks-control-color-picker__dropdown"
			contentClassName="lazyblocks-control-color-picker__dropdown-content"
			popoverProps={{
				placement: 'left-start',
				offset: 36,
				shift: true,
			}}
			renderToggle={({ isOpen, onToggle }) => (
				<Button
					className={classnames(
						'lazyblocks-control-color-toggle',
						isOpen ? 'lazyblocks-control-color-toggle-active' : ''
					)}
					onClick={onToggle}
				>
					<span
						className="lazyblocks-control-color-toggle-indicator"
						style={{ background: value || '' }}
					/>
					<span className="lazyblocks-control-color-toggle-label">
						{label}
					</span>
				</Button>
			)}
			renderContent={() => (
				<div className="lazyblocks-control-color-picker">
					<ColorPalette
						value={value}
						alpha={alpha}
						palette={palette}
						onChange={(val) => {
							onChange(val);
						}}
					/>
				</div>
			)}
		/>
	);
}

export default ColorControl;
