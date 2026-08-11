/**
 * Styles.
 */
import './editor.scss';

import { Button, TextareaControl, TextControl } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useDispatch, useSelect, select as wpSelect } from '@wordpress/data';
/**
 * WordPress dependencies.
 */
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
/**
 * External dependencies.
 */
import classnames from 'classnames/dedupe';
import slugify from 'slugify';

/**
 * Internal dependencies.
 */
import IconPicker from '../../../components/icon-picker';
import { CategorySettingsControl, KeywordsSettingsControl } from '../general';
import { templates } from './templates';

const { is_pro: isPro } = window.lazyblocksBlockBuilderData;

export default function Wizard({ onClose }) {
	// Filtered on every render and not at the module level, because the scripts
	// adding their own templates may run after this one.
	const wizardTemplates = applyFilters(
		'lzb.constructor.wizard.templates',
		templates
	);

	// A filter may replace the whole collection, so nothing here can rely on a
	// specific preset being present.
	const firstTemplate = Object.keys(wizardTemplates)[0] || '';
	const firstTemplateData = wizardTemplates[firstTemplate] || {};

	const [step, setStep] = useState(1);
	const [template, setTemplate] = useState(firstTemplate);
	const [icon, setIcon] = useState(firstTemplateData.blockIcon);
	const [title, setTitle] = useState(firstTemplateData.title);
	const [slug, setSlug] = useState(
		firstTemplate ? `${firstTemplate}-block` : ''
	);
	const [category, setCategory] = useState(
		firstTemplateData.category || 'text'
	);
	const [styles, setStyles] = useState([]);
	const [keywords, setKeywords] = useState(firstTemplateData.keywords);
	const [description, setDescription] = useState(
		firstTemplateData.description
	);
	const { updateBlockData, addControl } = useDispatch(
		'lazy-blocks/block-data'
	);

	const { postType } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor');

		return {
			postType: getCurrentPostType(),
		};
	}, []);

	const [, setPostTitle] = useEntityProp('postType', postType, 'title');

	const isLastStep = step === 3;

	function generateSlug(val) {
		const newSlug = slugify(val, {
			replacement: '-',
			lower: true,
			remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
		});

		setSlug(newSlug);
	}

	async function addControlWithId(data) {
		await addControl(data);

		// Get block data to find the ID of the repeater
		const blockData = wpSelect('lazy-blocks/block-data').getBlockData();

		let addedBlockId = null;
		Object.keys(blockData.controls)
			.reverse()
			.forEach((id) => {
				if (blockData.controls[id].name === data.name) {
					addedBlockId = id;
				}
			});

		return addedBlockId;
	}

	/**
	 * Process and add controls with proper parent-child relationships
	 *
	 * @param {Array} controls - Array of control objects
	 *
	 * @return {Promise<void>}
	 */
	async function processControls(controls) {
		// Map to store control names to their IDs once added
		const controlIdMap = {};

		// First, add all parent controls (non-child controls)
		const parentControls = Object.values(controls).filter(
			(control) => !control.child_of
		);

		// Add each parent control and track its ID
		for (const control of parentControls) {
			const controlId = await addControlWithId(control);

			if (controlId) {
				controlIdMap[control.name] = controlId;
			}
		}

		// Add all child controls with the correct parent ID.
		const childControls = Object.values(controls).filter(
			(control) => control.child_of
		);

		for (const control of childControls) {
			const parentId = controlIdMap[control.child_of];

			if (parentId) {
				// Add the child control with the correct parent ID
				addControl({
					...control,
					child_of: parentId,
				});
			} else {
				// eslint-disable-next-line no-console
				console.warn(
					`Parent control "${control.child_of}" not found for "${control.name}"`
				);
			}
		}
	}

	function skipSetup() {
		updateBlockData({
			code_single_output: true,
			code_output_method: 'php',
		});

		onClose();
	}

	async function finishSetup() {
		const templateData = wizardTemplates[template];

		// Every preset may be filtered out, and then there is nothing to set up.
		if (!templateData) {
			onClose();
			return;
		}

		setPostTitle(title);

		const newData = {
			icon,
			slug,
			category,
			keywords,
			description,
			styles,
			code_single_output: true,
		};

		const finalStyles = templateData.style.replace(
			/__BLOCK_CLASSNAME__/g,
			`.wp-block-lazyblock-${slug}`
		);

		if (isPro) {
			newData.code_frontend_html = templateData.template;
			newData.style_block = finalStyles;
		} else {
			newData.code_frontend_html = `${templateData.template}

{{!
	These inline styles created for example only.
	We recommend you purchase the Pro plugin and use Style editor instead
	for best practices and for better performance.
}}
<style>
${finalStyles}
</style>`;
		}

		await processControls(templateData.controls);

		updateBlockData(newData);
		onClose();
	}

	return (
		<div className="lzb-block-builder-wizard">
			<div className="lzb-block-builder-wizard__steps">
				<div
					className={classnames(
						step === 1 && 'lzb-block-builder-wizard__step-active'
					)}
				>
					<span>1</span>
					<div>{__('Choose Template', 'lazy-blocks')}</div>
				</div>
				<div
					className={classnames(
						step === 2 && 'lzb-block-builder-wizard__step-active'
					)}
				>
					<span>2</span>
					<div>{__('Set Block Title', 'lazy-blocks')}</div>
				</div>
				<div
					className={classnames(
						step === 3 && 'lzb-block-builder-wizard__step-active'
					)}
				>
					<span>3</span>
					<div>{__('Set Additional Options', 'lazy-blocks')}</div>
				</div>
			</div>

			{step === 1 && (
				<div className="lzb-block-builder-wizard-step-templates">
					{Object.keys(wizardTemplates).map((k) => (
						<Button
							key={k}
							onClick={(e) => {
								e.preventDefault();

								setTemplate(k);

								setIcon(wizardTemplates[k].blockIcon);
								setCategory(wizardTemplates[k].category);
								setTitle(`${wizardTemplates[k].title} Block`);
								setKeywords(wizardTemplates[k].keywords);
								setDescription(wizardTemplates[k].description);
								generateSlug(
									`${wizardTemplates[k].title} Block`
								);
								setStyles(wizardTemplates[k].styles || []);
							}}
							className={classnames(
								'lzb-block-builder-wizard-template',
								template === k &&
									'lzb-block-builder-wizard-template-active'
							)}
						>
							{wizardTemplates[k].icon}
							<span>{wizardTemplates[k].title}</span>
						</Button>
					))}
				</div>
			)}

			{step === 2 && (
				<div className="lzb-block-builder-wizard-step-title">
					<IconPicker
						value={icon}
						onChange={(value) => setIcon(value)}
					/>
					<div>
						<TextControl
							label={__('Title', 'lazy-blocks')}
							value={title}
							onChange={(val) => {
								setTitle(val);
								generateSlug(val);
							}}
							__next40pxDefaultSize
							__nextHasNoMarginBottom
						/>
						<span>{slug ? `lazyblock/${slug}` : ''}</span>
					</div>
				</div>
			)}

			{step === 3 && (
				<div className="lzb-block-builder-wizard-step-additional">
					<CategorySettingsControl
						value={category}
						onChange={setCategory}
					/>
					<KeywordsSettingsControl
						value={keywords}
						onChange={setKeywords}
					/>
					<TextareaControl
						label={__('Description', 'lazy-blocks')}
						value={description}
						onChange={(value) => setDescription(value)}
						__nextHasNoMarginBottom
					/>
				</div>
			)}

			<div className="lzb-block-builder-wizard__actions">
				{step !== 1 && (
					<Button variant="link" onClick={() => setStep(step - 1)}>
						{__('Previous Step', 'lazy-blocks')}
					</Button>
				)}
				{step === 1 && (
					<Button variant="link" onClick={skipSetup}>
						{__('Skip Setup Wizard', 'lazy-blocks')}
					</Button>
				)}
				<Button
					variant="primary"
					onClick={() => {
						if (isLastStep) {
							finishSetup();
						} else {
							setStep(step + 1);
						}
					}}
				>
					{isLastStep
						? __('Finish', 'lazy-blocks')
						: __('Continue', 'lazy-blocks')}
				</Button>
			</div>
		</div>
	);
}
