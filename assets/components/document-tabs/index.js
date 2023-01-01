// Import CSS
import './editor.scss';

const { __ } = wp.i18n;

const { useSelect, useDispatch } = wp.data;

let globalActiveTab = '';
let prevSelectedControlId = '';

export default function DocumentTabs({ children }) {
  const { activeTab } = useSelect((select) => {
    const { getSelectedControlId } = select('lazy-blocks/block-data');

    const selectedControlId = getSelectedControlId();

    if (!globalActiveTab && !selectedControlId) {
      globalActiveTab = 'block';
    }

    if (prevSelectedControlId !== selectedControlId) {
      prevSelectedControlId = selectedControlId;
      globalActiveTab = selectedControlId ? 'control' : 'block';
    }

    return {
      activeTab: globalActiveTab,
    };
  }, []);

  const { selectControl, clearSelectedControl } = useDispatch('lazy-blocks/block-data');

  function activateTab(name) {
    globalActiveTab = name;

    if (name === 'block') {
      clearSelectedControl();
    } else {
      selectControl('NO_CONTROL_ID_JUST_SELECT_TAB');
    }
  }

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
              aria-label={__('Block', 'lazy-blocks')}
            >
              {__('Block', 'lazy-blocks')}
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
              aria-label={__('Control', 'lazy-blocks')}
            >
              {__('Control', 'lazy-blocks')}
            </button>
          </li>
        </ul>
      </div>
      <div className="lazyblocks-component-document-tabs-content">
        {children({
          name: activeTab,
        })}
      </div>
    </div>
  );
}
