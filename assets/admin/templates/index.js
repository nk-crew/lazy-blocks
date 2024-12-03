/* eslint-disable no-underscore-dangle */
/**
 * Styles.
 */
import './index.scss';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import { useCallback, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import { PanelRow, SelectControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { PluginDocumentSettingPanel } from '@wordpress/editor';

/**
 * Internal dependencies
 */
const { used_post_types_for_templates: usedPostTypes } =
	window.lazyblocksTemplatesData || {};

function UpdateEditor() {
	const { postType, postTypes, blocks } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor');
		const { getPostTypes } = select('core');
		const { getBlocks } = select('core/block-editor');

		return {
			postType: getCurrentPostType(),
			postTypes:
				getPostTypes({
					show_ui: true,
					per_page: -1,
				}) || [],
			blocks: getBlocks(),
		};
	}, []);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	const templatePostTypes = meta._lzb_template_post_types || [];
	const templateLock = meta._lzb_template_lock || '';
	const templateBlocks = meta._lzb_template_blocks || '';

	function updateMeta(name, val) {
		setMeta({ ...meta, [name]: val });
	}

	/**
	 * Convert blocks data to template data.
	 *
	 * @param {Array} blocksList - blocks list.
	 *
	 * @return {Array} - blocks template.
	 */
	function convertBlocksToTemplate(blocksList) {
		const result = [];

		blocksList.forEach((blockData) => {
			const resultBlockData = [blockData.name, blockData.attributes];

			if (blockData.innerBlocks && blockData.innerBlocks.length) {
				resultBlockData.push(
					convertBlocksToTemplate(blockData.innerBlocks)
				);
			}

			result.push(resultBlockData);
		});

		return result;
	}

	/**
	 * Convert blocks to the meta to easily work with it in PHP.
	 *
	 * @param {Array}  blocksList           - blocks list.
	 * @param {string} templateBlocksString - block string.
	 */
	function updateBlocksMeta(blocksList, templateBlocksString) {
		const blocksString = encodeURIComponent(
			JSON.stringify(convertBlocksToTemplate(blocksList))
		);

		if (templateBlocksString !== blocksString) {
			updateMeta('_lzb_template_blocks', blocksString);
		}
	}

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const updateBlocksMetaDebounce = useCallback(
		useDebounce(updateBlocksMeta, 500),
		[]
	);

	useEffect(() => {
		updateBlocksMetaDebounce(blocks, templateBlocks);
	}, [blocks, templateBlocks, updateBlocksMetaDebounce]);

	const templateLockOptions = [
		{
			label: __('None', 'lazy-blocks'),
			value: '',
		},
		{
			label: __('All - prevents all operations', 'lazy-blocks'),
			value: 'all',
		},
		{
			label: __(
				'Insert - prevents inserting new blocks, but allows moving existing ones',
				'lazy-blocks'
			),
			value: 'insert',
		},
		{
			label: __(
				'Content Only - prevents all operations, except the content editing.',
				'lazy-blocks'
			),
			value: 'contentOnly',
		},
	];

	// Default options.
	const postTypesOptions = [];
	const postTypesArray = [];

	postTypes
		.filter(
			(post) =>
				post.viewable &&
				post.slug !== 'lazyblocks' &&
				post.slug !== 'lazyblocks_templates' &&
				post.slug !== 'attachment'
		)
		.forEach((post) => {
			let { label } = post;

			if (post.labels && post.labels.singular_name) {
				label = post.labels.singular_name;
			}

			postTypesArray.push(post.slug);

			postTypesOptions.push({
				label,
				value: post.slug,
				disabled: usedPostTypes.includes(post.slug),
			});
		});

	// Display selected post type in select in case if it is not exists.
	// For example, when removed plugin, which works with this custom post type.
	if (templatePostTypes && templatePostTypes.length) {
		templatePostTypes.forEach((tplPostType) => {
			if (!postTypesArray.includes(tplPostType)) {
				postTypesOptions.push({
					label: tplPostType,
					value: tplPostType,
				});
			}
		});
	}

	return (
		<PluginDocumentSettingPanel
			name="LZBTemplateSettings"
			title={__('Template Settings', 'lazy-blocks')}
			className="lzb-template-settings-panel"
		>
			<PanelRow>
				<div style={{ width: '100%' }}>
					<SelectControl
						label={__('Post Types', 'lazy-blocks')}
						multiple
						options={postTypesOptions}
						value={templatePostTypes}
						onChange={(value) => {
							updateMeta('_lzb_template_post_types', value);
						}}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</PanelRow>
			<PanelRow>
				<div style={{ width: '100%' }}>
					<SelectControl
						label={__('Template Lock', 'lazy-blocks')}
						options={templateLockOptions}
						value={templateLock}
						onChange={(value) => {
							updateMeta('_lzb_template_lock', value);
						}}
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
				</div>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin('lazy-blocks-template', {
	render: UpdateEditor,
});
