// Import CSS
import './editor.scss';

const { __ } = wp.i18n;

const { Component } = wp.element;

const { compose } = wp.compose;

const { withSelect, withDispatch } = wp.data;

class DocumentTabs extends Component {
  render() {
    const { activeTab, activateTab } = this.props;

    return (
      <div className="lazyblocks-component-document-tabs">
        <div className="components-panel__header edit-post-sidebar-header edit-post-sidebar__panel-tabs">
          <ul>
            <li>
              {/* eslint-disable-next-line react/button-has-type */}
              <button
                onClick={() => {
                  activateTab('block');
                }}
                className={`components-button edit-post-sidebar__panel-tab ${
                  activeTab === 'block' ? 'is-active' : ''
                }`}
                aria-label={__('Block', '@@text_domain')}
              >
                {__('Block', '@@text_domain')}
              </button>
            </li>
            <li>
              {/* eslint-disable-next-line react/button-has-type */}
              <button
                onClick={() => {
                  activateTab('control');
                }}
                className={`components-button edit-post-sidebar__panel-tab ${
                  activeTab === 'control' ? 'is-active' : ''
                }`}
                aria-label={__('Control', '@@text_domain')}
              >
                {__('Control', '@@text_domain')}
              </button>
            </li>
          </ul>
        </div>
        <div className="lazyblocks-component-document-tabs-content">
          {this.props.children({
            name: activeTab,
          })}
        </div>
      </div>
    );
  }
}

let activeTab = '';
let prevSelectedControlId = '';

export default compose([
  withSelect((select) => {
    const { getSelectedControlId } = select('lazy-blocks/block-data');

    const selectedControlId = getSelectedControlId();

    if (!activeTab && !selectedControlId) {
      activeTab = 'block';
    }

    if (prevSelectedControlId !== selectedControlId) {
      prevSelectedControlId = selectedControlId;
      activeTab = selectedControlId ? 'control' : 'block';
    }

    return {
      activeTab,
    };
  }),
  withDispatch((dispatch) => {
    const { selectControl, clearSelectedControl } = dispatch('lazy-blocks/block-data');

    return {
      activateTab(name) {
        activeTab = name;

        if (name === 'block') {
          clearSelectedControl();
        } else {
          selectControl('NO_CONTROL_ID_JUST_SELECT_TAB');
        }
      },
    };
  }),
])(DocumentTabs);
