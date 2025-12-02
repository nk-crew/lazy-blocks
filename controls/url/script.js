/**
 * External dependencies.
 */
import shorthash from 'shorthash';

/**
 * WordPress dependencies.
 */
import { useState } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { LinkControl } from '@wordpress/block-editor';
import { TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';
import Modal from '../../assets/components/modal';

/**
 * Base URL control component - renders BaseControl with LinkControl.
 * This is the standard behavior that can be extended via filters.
 *
 * @param {Object} props - Component props.
 */
function ComponentRender(props) {
	const [key, setKey] = useState(shorthash.unique(`${new Date()}`));
	const baseControlProps = useBlockControlProps(props);

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
 * Content placement component - wraps the control in a modal.
 *
 * @param {Object} props - Component props.
 */
function ComponentInContentRender(props) {
	const [isOpen, setIsOpen] = useState(false);

	const baseControlProps = useBlockControlProps(props);

	const value = props.getValue();

	return (
		<>
			<div className="lazyblocks-control-url-in-content">
				<Button
					className="lazyblocks-control-url-in-content-button"
					aria-label={__('Edit URL', 'lazy-blocks')}
					onClick={(e) => {
						// Prevent the button click from bubbling to the wrapper
						// which would re-open the popover if it was just closed.
						e.stopPropagation();
						setIsOpen(true);
					}}
					aria-expanded={isOpen ? 'true' : 'false'}
				/>
				<BaseControl {...baseControlProps}>
					<TextControl
						value={value}
						placeholder={
							props.data.placeholder ||
							__('Add URL', 'lazy-blocks')
						}
						readOnly
						// Prevent focusing the input directly — overlay button handles interactions
						tabIndex={-1}
					/>
				</BaseControl>
			</div>
			{isOpen && (
				<Modal
					title={__('URL Editor', 'lazy-blocks')}
					onRequestClose={() => setIsOpen(false)}
					focusOnMount="firstContentElement"
					size="medium"
					className="lazyblocks-control-url-content-modal"
				>
					{props.render}
				</Modal>
			)}
		</>
	);
}

/**
 * Control render in editor.
 */
addFilter('lzb.editor.control.url.render', 'lzb.editor', (render, props) => (
	<ComponentRender {...props} />
));

/**
 * Content placement render - wraps control in modal for content placement.
 * Uses higher priority (50) to override the base render.
 */
addFilter(
	'lzb.editor.control.url.render',
	'lzb.editor.content',
	(render, props) => {
		if (props.placement !== 'content') {
			return render;
		}

		return <ComponentInContentRender {...props} render={render} />;
	},
	50
);

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
