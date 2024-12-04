/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { PanelBody, TextControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import BaseControl from '../../assets/components/base-control';
import useBlockControlProps from '../../assets/hooks/use-block-control-props';

/**
 * Control render in editor.
 */
addFilter(
	'lzb.editor.control.password.render',
	'lzb.editor',
	(render, props) => {
		const maxlength = props.data.characters_limit
			? parseInt(props.data.characters_limit, 10)
			: '';

		return (
			<BaseControl {...useBlockControlProps(props, { label: false })}>
				<TextControl
					type="password"
					label={props.data.label}
					maxLength={maxlength}
					placeholder={props.data.placeholder}
					value={props.getValue()}
					onChange={props.onChange}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</BaseControl>
		);
	}
);

/**
 * Control settings render in block builder.
 */
addFilter(
	'lzb.constructor.control.password.settings',
	'lzb.constructor',
	(render, props) => {
		const { updateData, data } = props;

		return (
			<>
				<PanelBody>
					<TextControl
						label={__('Placeholder', 'lazy-blocks')}
						value={data.placeholder}
						onChange={(value) => updateData({ placeholder: value })}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
				<PanelBody>
					<TextControl
						label={__('Characters Limit', 'lazy-blocks')}
						help={__(
							'Maximum number of characters allowed. Leave blank to no limit.',
							'lazy-blocks'
						)}
						value={
							data.characters_limit
								? parseInt(data.characters_limit, 10)
								: ''
						}
						type="number"
						min={0}
						max={524288}
						onChange={(value) =>
							updateData({ characters_limit: `${value}` })
						}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</PanelBody>
			</>
		);
	}
);
