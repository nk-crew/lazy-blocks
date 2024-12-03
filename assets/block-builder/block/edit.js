/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { Spinner, PanelBody } from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';

/**
 * Internal dependencies.
 */
import ProNotice from '../../components/pro-notice';
import DocumentTabs from '../../components/document-tabs';
import Box from '../../components/box';
import TitleSettings from '../boxes/title';
import GeneralSettings from '../boxes/general';
import StylesSettings from '../boxes/styles';
import SupportsSettings from '../boxes/supports';
import SupportsGhostKitSettings from '../boxes/supports-ghost-kit';
import ConditionSettings from '../boxes/condition';
import ControlsSettings from '../boxes/controls';
import SelectedControlSettings from '../boxes/selected-control-settings';
import CustomCodeSettings from '../boxes/code';
import CodePreview from '../boxes/code-preview';
import PreviewErrorBoundary from '../../components/preview-error-boundary';

import '../../components/tab-panel';

export default function BlockBuilder() {
	const [codeContext, setCodeContext] = useState('frontend');

	const { blockData } = useSelect(
		(select) => ({
			blockData: select('lazy-blocks/block-data').getBlockData(),
		}),
		[]
	);

	const { updateBlockData } = useDispatch('lazy-blocks/block-data');

	if (!blockData || typeof blockData.slug === 'undefined') {
		return (
			<div className="lzb-block-builder-loading">
				<Spinner />
			</div>
		);
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
									title={__('Styles', 'lazy-blocks')}
									initialOpen={false}
								>
									<StylesSettings
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
			<div className="lzb-block-builder">
				<TitleSettings data={blockData} updateData={updateBlockData} />
				<ControlsSettings
					data={blockData}
					updateData={updateBlockData}
				/>
				<Box no-paddings>
					<CustomCodeSettings
						data={blockData}
						updateData={updateBlockData}
						onTabChange={(value) => setCodeContext(value)}
					/>
				</Box>
				{/* Code/Template Preview */}
				<PreviewErrorBoundary>
					<Box no-paddings>
						<CodePreview
							data={blockData}
							codeContext={codeContext}
						/>
					</Box>
				</PreviewErrorBoundary>
			</div>
		</>
	);
}
