/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	BaseControl,
	Button,
	ToggleControl,
	TextControl,
} from '@wordpress/components';

const { plugin_version: pluginVersion } = window.lazyblocksBlockBuilderData;

export default function SaveInMetaRow(props) {
	const { updateData, data } = props;

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-settings-row-save-in-meta"
				label={__('Save in Meta', 'lazy-blocks')}
				help={
					<Button
						id="lazyblocks-settings-row-save-in-meta"
						size="small"
						variant="secondary"
						href={`https://www.lazyblocks.com/docs/examples/display-custom-fields-meta/?utm_source=plugin&utm_medium=block-builder&utm_campaign=how_to_use_meta&utm_content=${pluginVersion}`}
						target="_blank"
						rel="noopener noreferrer"
						style={{ marginTop: '10px' }}
					>
						{__('How to use?', 'lazy-blocks')}
					</Button>
				}
				__nextHasNoMarginBottom
			>
				<ToggleControl
					label={__('Yes', 'lazy-blocks')}
					checked={data.save_in_meta === 'true'}
					onChange={(value) =>
						updateData({ save_in_meta: value ? 'true' : 'false' })
					}
					__nextHasNoMarginBottom
				/>
			</BaseControl>
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
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			) : (
				''
			)}
		</PanelBody>
	);
}
