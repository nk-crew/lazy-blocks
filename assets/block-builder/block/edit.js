/**
 * WordPress dependencies.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, Spinner } from '@wordpress/components';
import { useEntityProp } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import DocumentTabs from '../../components/document-tabs';
import PreviewErrorBoundary from '../../components/preview-error-boundary';
/**
 * Internal dependencies.
 */
import ProNotice from '../../components/pro-notice';
import StyleProviderWrapper from '../../components/select/style-provider';
import CustomCodeSettings from '../boxes/code';
import CodePreview from '../boxes/code-preview';
import ConditionSettings from '../boxes/condition';
import ControlsSettings from '../boxes/controls';
import GeneralSettings from '../boxes/general';
import SelectedControlSettings from '../boxes/selected-control-settings';
import StyleVariationsSettings from '../boxes/style-variations';
import SupportsSettings from '../boxes/supports';
import SupportsGhostKitSettings from '../boxes/supports-ghost-kit';
import TitleSettings from '../boxes/title';
import Wizard from '../boxes/wizard';

import '../../components/tab-panel';

export default function BlockBuilder() {
	const [codeContext, setCodeContext] = useState('frontend');
	const [setupWizardClosed, setSetupWizardClosed] = useState(false);

	const blockData = useSelect(
		(select) => select('lazy-blocks/block-data').getBlockData(),
		[]
	);

	const { updateBlockData } = useDispatch('lazy-blocks/block-data');

	const { postType } = useSelect((select) => {
		const { getCurrentPostType } = select('core/editor');

		return {
			postType: getCurrentPostType(),
		};
	}, []);

	const [postTitle] = useEntityProp('postType', postType, 'title');

	if (!blockData || typeof blockData.slug === 'undefined') {
		return (
			<div className="lzb-block-builder-loading">
				<Spinner />
			</div>
		);
	}

	const isSetupWizard =
		!postTitle &&
		!blockData.slug &&
		!blockData.icon &&
		!blockData.description &&
		!blockData.keywords &&
		!Object.keys(blockData.controls).length;

	if (isSetupWizard && !setupWizardClosed) {
		return <Wizard onClose={() => setSetupWizardClosed(true)} />;
	}

	// Define default panels
	const defaultPanels = [
		{
			name: 'style-variations',
			title: __('Style Variations', 'lazy-blocks'),
			component: StyleVariationsSettings,
			initialOpen: false,
		},
		{
			name: 'supports',
			title: __('Supports', 'lazy-blocks'),
			component: SupportsSettings,
			initialOpen: false,
		},
		{
			name: 'supports-ghost-kit',
			title: __('Supports Ghost Kit', 'lazy-blocks'),
			component: SupportsGhostKitSettings,
			initialOpen: false,
		},
		{
			name: 'condition',
			title: __('Condition', 'lazy-blocks'),
			component: ConditionSettings,
			initialOpen: false,
		},
	];

	// Apply filters to allow extensions
	const panels = applyFilters('lzb.constructor.panels', defaultPanels, {
		blockData,
		updateBlockData,
	});

	return (
		<>
			<InspectorControls>
				<DocumentTabs>
					{(tabData) => {
						// Selected control settings.
						if (tabData.name === 'control') {
							return <SelectedControlSettings />;
						}

						// Block settings.
						return (
							<>
								<GeneralSettings
									data={blockData}
									updateData={updateBlockData}
								/>
								<ProNotice />
								{panels.map((panel) => {
									const PanelComponent = panel.component;
									return (
										<PanelBody
											key={panel.name}
											title={panel.title}
											initialOpen={panel.initialOpen}
										>
											<PanelComponent
												data={blockData}
												updateData={updateBlockData}
											/>
										</PanelBody>
									);
								})}
							</>
						);
					}}
				</DocumentTabs>
			</InspectorControls>
			<StyleProviderWrapper>
				<div className="lzb-block-builder">
					<TitleSettings
						data={blockData}
						updateData={updateBlockData}
					/>
					<ControlsSettings
						data={blockData}
						updateData={updateBlockData}
					/>
					<CustomCodeSettings
						data={blockData}
						updateData={updateBlockData}
						onTabChange={(value) => setCodeContext(value)}
					/>
					{/* Code/Template Preview */}
					<PreviewErrorBoundary>
						<CodePreview
							data={blockData}
							codeContext={codeContext}
						/>
					</PreviewErrorBoundary>
				</div>
			</StyleProviderWrapper>
		</>
	);
}
