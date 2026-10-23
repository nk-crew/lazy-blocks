/**
 * WordPress dependencies.
 */

import {
	ExternalLink,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const { plugin_version: pluginVersion } = window.lazyblocksBlockBuilderData;

export default function SaveInMetaRow(props) {
	const { updateData, data } = props;

	return (
		<>
			<ToggleControl
				label={__('Save in post meta', 'lazy-blocks')}
				help={
					<ExternalLink
						href={`https://www.lazyblocks.com/docs/examples/display-custom-fields-meta/?utm_source=plugin&utm_medium=block-builder&utm_campaign=how_to_use_meta&utm_content=${pluginVersion}`}
					>
						{__('How to use?', 'lazy-blocks')}
					</ExternalLink>
				}
				checked={data.save_in_meta === 'true'}
				onChange={(value) =>
					updateData({ save_in_meta: value ? 'true' : 'false' })
				}
				__nextHasNoMarginBottom
			/>
			{data.save_in_meta === 'true' ? (
				<TextControl
					label={__('Meta custom name (optional)', 'lazy-blocks')}
					value={data.save_in_meta_name}
					onChange={(value) =>
						updateData({ save_in_meta_name: value })
					}
					placeholder={
						data.name || __('Unique metabox name', 'lazy-blocks')
					}
					__nextHasNoMarginBottom
				/>
			) : null}
		</>
	);
}
