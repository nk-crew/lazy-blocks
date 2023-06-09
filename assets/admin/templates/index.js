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
import { useSelect, useDispatch } from '@wordpress/data';
import { PanelRow, SelectControl } from '@wordpress/components';
import { useDebounce } from '@wordpress/compose';
import { PluginDocumentSettingPanel } from '@wordpress/edit-post';

/**
 * Internal dependencies
 */
const { used_post_types_for_templates: usedPostTypes } =
	window.lazyblocksTemplatesData || {};

function UpdateEditor() {
	const {
		templatePostTypes,
		templateLock,
		templateBlocks,
		postTypes,
		blocks,
	} = useSelect((select) => {
		const { getEditedPostAttribute } = select('core/editor');
		const { getPostTypes } = select('core');
		const { getBlocks } = select('core/block-editor');

		const meta = getEditedPostAttribute('meta') || {};

		return {
			templatePostTypes: meta._lzb_template_post_types || [],
			templateLock: meta._lzb_template_lock || '',
			templateBlocks: meta._lzb_template_blocks || '',
			postTypes:
				getPostTypes({
					show_ui: true,
					per_page: -1,
				}) || [],
			blocks: getBlocks(),
		};
	}, []);

	const { editPost } = useDispatch('core/editor');

	function updateMeta(name, val) {
		editPost({ meta: { [name]: val } });
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
		templatePostTypes.forEach((postType) => {
			if (!postTypesArray.includes(postType)) {
				postTypesOptions.push({
					label: postType,
					value: postType,
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
					/>
				</div>
			</PanelRow>
		</PluginDocumentSettingPanel>
	);
}

registerPlugin('lazy-blocks-template', {
	render: UpdateEditor,
});
