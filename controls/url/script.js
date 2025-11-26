/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { useState, useRef, useEffect } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { LinkControl } from '@wordpress/block-editor';
import { Popover, TextControl, Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons'; // Import close icon
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

function ComponentRender(props) {
	const [key, setKey] = useState(shorthash.unique(`${new Date()}`));
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);
	const anchorRef = useRef();
	const inputRef = useRef();
	// block so the effect can reference the current input value. The effect is
	// added inside the 'content' render branch.

	// Keep label/help visible for the control so it behaves like other controls
	const baseControlProps = useBlockControlProps(props);

	// When popover opens, try to move focus into the popover's input.
	// We use a small timeout so the Popover (which may render into a portal)
	// has time to mount its DOM before we query for the input.
	useEffect(() => {
		if (!isPopoverVisible) {
			return;
		}

		const timeout = setTimeout(() => {
			// Try to find a visible input inside a WordPress Popover instance.
			const popoverInput =
				document.querySelector(
					'.components-popover input[type="text"]:not([readonly])'
				) || document.querySelector('.components-popover input');
			if (popoverInput && typeof popoverInput.focus === 'function') {
				popoverInput.focus();
				if (typeof popoverInput.select === 'function') {
					popoverInput.select();
				}
			}
		}, 0);

		return () => clearTimeout(timeout);
	}, [isPopoverVisible]);

	// If placement is 'content', render a TextControl that opens a Popover with the full LinkControl.
	if (props.placement === 'content') {
		const value = props.getValue();

		return (
			<div
				ref={anchorRef}
				className={
					'lzb-url-control__wrapper' +
					(isPopoverVisible ? ' is-popover-open' : '')
				}
				// Make the wrapper interactive & accessible: open popover on click/keyboard, prevent input receiving native focus
				role="button"
				tabIndex={0}
				onClick={() => {
					// If popover is already open, ignore clicks on the wrapper so
					// interactive elements inside the popover (like the close button)
					// can handle the event without the wrapper re-opening it.
					if (isPopoverVisible) {
						return;
					}
					// Log current anchor/input refs for debugging before opening popover.
					setIsPopoverVisible(true);
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						if (!isPopoverVisible) {
							setIsPopoverVisible(true);
						}
					}
				}}
			>
				<BaseControl {...baseControlProps}>
					{/* TextControl is always visible — overlay button is used to open the popover */}
					<div
						className="lzb-url-control__input"
						style={{ position: 'relative' }}
					>
						<TextControl
							value={value}
							placeholder={
								props.data.placeholder ||
								__('Add URL', 'lazy-blocks')
							}
							readOnly
							// Prevent focusing the input directly — overlay button handles interactions
							inputProps={{ tabIndex: -1 }}
							inputRef={inputRef}
						/>
					</div>
				</BaseControl>
				{isPopoverVisible && (
					<Popover
						/* Anchor the popover to the visible wrapper first so it isn't attached
                           to a non-focusable input; avoid forcing focus on mount so the
                           LinkControl can manage its internal focus. */
						anchor={anchorRef.current || inputRef.current}
						className="lzb-url-popover"
						onClose={() => setIsPopoverVisible(false)}
						focusOnMount={false}
						placement="bottom-start" // Adjust popover placement
						offset={0} // Slight offset so the popover sits clearly under the input element
					>
						<Button
							className="components-button components-icon-button lzb-url-popover-close"
							icon={closeSmall}
							label="Close popover"
							onClick={() => setIsPopoverVisible(false)}
						/>
						<div className="lzb-url-popover__content">
							<LinkControl
								key={key}
								className="wp-block-navigation-link__inline-link-input"
								settings={[]}
								opensInNewTab={false}
								value={{
									url: props.getValue(),
								}}
								onChange={({ url: newURL = '' }) => {
									props.onChange(newURL);
								}}
								onRemove={() => {
									props.onChange('');
									setKey(shorthash.unique(`${new Date()}`));
								}}
							/>
						</div>
					</Popover>
				)}
			</div>
		);
	}

	// Default LinkControl render for other placements.
	return (
		<BaseControl {...baseControlProps}>
			<LinkControl
				key={key}
				className="wp-block-navigation-link__inline-link-input"
				opensInNewTab={false}
				value={{
					url: props.getValue(),
				}}
				onChange={({ url: newURL = '' }) => {
					props.onChange(newURL);
				}}
				onRemove={() => {
					props.onChange('');
					setKey(shorthash.unique(`${new Date()}`));
				}}
			/>
		</BaseControl>
	);
}

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.url.render', 'lzb.editor', (render, props) => (
	<ComponentRender {...props} />
));

/**
 * Required check.
 * Just check for empty value. Previously we used advanced URL validation, but we can't restrict values like '#' or 'relative-url-string'.
 *
 * @param {Object} validationData
 * @param {number} value
 *
 * @return {Object} validation data.
 */
function validate(validationData, value) {
	if (!value) {
		return { valid: false };
	}

	return validationData;
}
addFilter('lzb.editor.control.url.validate', 'lzb.editor', validate);
