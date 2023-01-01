// Internal Dependencies
import ProNotice from '../../components/pro-notice';
import DocumentTabs from '../../components/document-tabs';
import Box from '../../components/box';
import TitleSettings from '../boxes/title';
import GeneralSettings from '../boxes/general';
import SupportsSettings from '../boxes/supports';
import ConditionSettings from '../boxes/condition';
import ControlsSettings from '../boxes/controls';
import SelectedControlSettings from '../boxes/selected-control-settings';
import CustomCodeSettings from '../boxes/code';
import CodePreview from '../boxes/code-preview';
import PreviewErrorBoundary from '../boxes/code-preview/preview-error-boundary';

import '../../components/tab-panel';

/**
 * Internal dependencies
 */
const { __ } = wp.i18n;

const { Fragment, useState } = wp.element;

const { useSelect, useDispatch } = wp.data;

const { Spinner, PanelBody } = wp.components;

const { InspectorControls } = wp.blockEditor;

export default function ConstructorBlock() {
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
      <div className="lzb-constructor-loading">
        <Spinner />
      </div>
    );
  }

  return (
    <Fragment>
      <InspectorControls>
        <DocumentTabs>
          {(tabData) => {
            // Selected control settings.
            if (tabData.name === 'control') {
              return <SelectedControlSettings />;
            }

            // Block settings.
            return (
              <Fragment>
                <GeneralSettings data={blockData} updateData={updateBlockData} />
                <ProNotice />
                <PanelBody title={__('Supports', 'lazy-blocks')} initialOpen={false}>
                  <SupportsSettings data={blockData} updateData={updateBlockData} />
                </PanelBody>
                <PanelBody title={__('Condition', 'lazy-blocks')} initialOpen={false}>
                  <ConditionSettings data={blockData} updateData={updateBlockData} />
                </PanelBody>
              </Fragment>
            );
          }}
        </DocumentTabs>
      </InspectorControls>
      <div className="lzb-constructor">
        <TitleSettings data={blockData} updateData={updateBlockData} />
        <ControlsSettings data={blockData} updateData={updateBlockData} />
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
            <CodePreview data={blockData} codeContext={codeContext} />
          </Box>
        </PreviewErrorBoundary>
      </div>
    </Fragment>
  );
}
