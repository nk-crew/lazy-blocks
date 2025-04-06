/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Spinner, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';

/**
 * Internal dependencies.
 */
import ProNotice from '../../components/pro-notice';
import DocumentTabs from '../../components/document-tabs';
import StyleProviderWrapper from '../../components/select/style-provider';
import TitleSettings from '../boxes/title';
import GeneralSettings from '../boxes/general';
import StyleVariationsSettings from '../boxes/style-variations';
import SupportsSettings from '../boxes/supports';
import SupportsGhostKitSettings from '../boxes/supports-ghost-kit';
import ConditionSettings from '../boxes/condition';
import ControlsSettings from '../boxes/controls';
import SelectedControlSettings from '../boxes/selected-control-settings';
import CustomCodeSettings from '../boxes/code';
import CodePreview from '../boxes/code-preview';
import Wizard from '../boxes/wizard';
import PreviewErrorBoundary from '../../components/preview-error-boundary';

import '../../components/tab-panel';

export default function BlockBuilder() {
	const [codeContext, setCodeContext] = useState('frontend');
	const [setupWizardClosed, setSetupWizardClosed] = useState(false);

	const { blockData } = useSelect(
		(select) => ({
			blockData: select('lazy-blocks/block-data').getBlockData(),
		}),
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
								<PanelBody
									title={__(
										'Style Variations',
										'lazy-blocks'
									)}
									initialOpen={false}
								>
									<StyleVariationsSettings
										data={blockData}
										updateData={updateBlockData}
									/>
								</PanelBody>
								<PanelBody
									title={__('Supports', 'lazy-blocks')}
									initialOpen={false}
								>
									<SupportsSettings
										data={blockData}
										updateData={updateBlockData}
									/>
								</PanelBody>
								<PanelBody
									title={__(
										'Supports Ghost Kit',
										'lazy-blocks'
									)}
									initialOpen={false}
								>
									<SupportsGhostKitSettings
										data={blockData}
										updateData={updateBlockData}
									/>
								</PanelBody>
								<PanelBody
									title={__('Condition', 'lazy-blocks')}
									initialOpen={false}
								>
									<ConditionSettings
										data={blockData}
										updateData={updateBlockData}
									/>
								</PanelBody>
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
