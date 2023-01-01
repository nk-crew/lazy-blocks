import getControlTypeData from '../../../../utils/get-control-type-data';
import Modal from '../../../../components/modal';

const { __ } = wp.i18n;

const { useState } = wp.element;

const { PanelBody, BaseControl, TextControl } = wp.components;

const { useSelect } = wp.data;

const { controls, controls_categories: allCategories } = window.lazyblocksConstructorData;

const hiddenIconCategories = {};

export default function TypeRow(props) {
  const [modalOpened, setModalOpened] = useState(false);
  const [search, setSearch] = useState('');

  const { updateData, data } = props;
  const { type = '' } = data;

  const { blockData } = useSelect((select) => {
    const { getBlockData } = select('lazy-blocks/block-data');

    return {
      blockData: getBlockData(),
    };
  }, []);

  const searchString = search.toLowerCase();
  const availableCategories = {};

  const types = Object.keys(controls)
    .filter((k) => {
      const iconName = controls[k].name;

      if (!searchString || (searchString && iconName.indexOf(searchString.toLowerCase()) > -1)) {
        return true;
      }

      return false;
    })
    .map((k) => {
      const controlTypeData = getControlTypeData(controls[k].name);
      let isDisabled = false;
      let isHiddenFromSelect = false;

      // Disabled restrictions.
      if (!isDisabled && controlTypeData) {
        // restrict as child.
        if (!controlTypeData.restrictions.as_child) {
          isDisabled = data.child_of;
        }

        // restrict once per block.
        if (!isDisabled && controlTypeData.restrictions.once && blockData && blockData.controls) {
          Object.keys(blockData.controls).forEach((i) => {
            if (controlTypeData.name === blockData.controls[i].type) {
              isDisabled = true;
            }
          });
        }
      }

      // Hidden restrictions.
      if (!isHiddenFromSelect && controlTypeData?.restrictions?.hidden_from_select) {
        isHiddenFromSelect = true;
      }

      if (!isHiddenFromSelect) {
        availableCategories[controls[k].category] = 1;
      }

      return {
        name: controls[k].name,
        label: controls[k].label,
        category: controls[k].category,
        icon: controlTypeData.icon,
        isDisabled,
        isHiddenFromSelect,
      };
    });

  const controlTypeData = getControlTypeData(type);

  return (
    <PanelBody>
      <BaseControl label={__('Type', 'lazy-blocks')}>
        {/* eslint-disable-next-line react/button-has-type */}
        <button
          onClick={() => setModalOpened(!modalOpened)}
          className="lzb-constructor-type-toggle"
        >
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: controlTypeData.icon }} />
          {controlTypeData.label}
          <svg
            height="20"
            width="20"
            viewBox="0 0 20 20"
            aria-hidden="true"
            focusable="false"
            className="css-6q0nyr-Svg"
          >
            <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z" />
          </svg>
        </button>

        {modalOpened ? (
          <Modal
            title={__('Control Type', 'lazy-blocks')}
            position="top"
            onRequestClose={() => setModalOpened(!modalOpened)}
          >
            <div className="lzb-constructor-type-dropdown">
              <TextControl
                value={search}
                onChange={(searchVal) => setSearch(searchVal)}
                placeholder={__('Type to Search...', 'lazy-blocks')}
                autoComplete="off"
                className="lzb-constructor-type-search"
                autoFocus
              />
              {Object.keys(availableCategories).map((cat) => (
                <PanelBody
                  key={cat}
                  title={allCategories[cat] || cat}
                  initialOpen={!hiddenIconCategories[cat]}
                  onToggle={() => {
                    hiddenIconCategories[cat] =
                      typeof hiddenIconCategories[cat] === 'undefined'
                        ? true
                        : !hiddenIconCategories[cat];
                  }}
                >
                  {types.map((thisType) => {
                    if (thisType.category !== cat || thisType.isHiddenFromSelect) {
                      return null;
                    }

                    return (
                      // eslint-disable-next-line react/button-has-type
                      <button
                        key={cat + thisType.name}
                        onClick={() => {
                          updateData({ type: thisType.name });
                          setModalOpened(false);
                        }}
                        disabled={thisType.isDisabled}
                        className={type === thisType.name ? 'is-active' : ''}
                      >
                        {/* eslint-disable-next-line react/no-danger */}
                        <span dangerouslySetInnerHTML={{ __html: thisType.icon }} />
                        {thisType.label}
                      </button>
                    );
                  })}
                </PanelBody>
              ))}
            </div>
          </Modal>
        ) : (
          ''
        )}
      </BaseControl>
    </PanelBody>
  );
}
