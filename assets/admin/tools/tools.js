/* eslint-disable react/jsx-one-expression-per-line */

/**
 * Internal Dependencies
 */
import Copied from '../../components/copied';

const { lazyblocksToolsData: data } = window;

/**
 * WordPress Dependencies
 */
const { __ } = wp.i18n;

const { Fragment, useState, useRef } = wp.element;

const { BaseControl, TextareaControl, ToggleControl } = wp.components;

/**
 * Component
 */
export default function Templates() {
  const [showBlocksPHP, setShowBlocksPHP] = useState(false);
  const [showTemplatesPHP, setShowTemplatesPHP] = useState(false);
  const [disabledBlocks, setDisabledBlocks] = useState({});
  const [disabledTemplates, setDisabledTemplates] = useState({});
  const [copiedBlocks, setCopiedBlocks] = useState(false);
  const [copiedTemplates, setCopiedTemplates] = useState(false);

  const showStates = {
    showBlocksPHP,
    showTemplatesPHP,
  };
  const disabledStates = {
    disabledBlocks,
    disabledTemplates,
  };
  const copiedStates = {
    copiedBlocks,
    copiedTemplates,
  };

  const copiedTimeouts = useRef({});

  function getDownloadJSONUrl(type = 'blocks') {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    let url = window.location.href;

    data[type].forEach((item) => {
      if (!disabledStates[`disabled${typeLabel}`][item.data.id]) {
        url += `&lazyblocks_export_${type}[]=${item.data.id}`;
      }
    });

    return url;
  }

  /**
   * Get blocks/templates PHP string code depending on checked post types.
   *
   * @param {String} type - blocks or templates.
   *
   * @return {String} code.
   */
  function getPHPStringCode(type = 'blocks') {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

    let result = '';

    data[type].forEach((item) => {
      if (!disabledStates[`disabled${typeLabel}`][item.data.id]) {
        result += item.php_string_code;
      }
    });

    if (result) {
      result = `add_action( 'lzb/init', function() {\n${result}\n} );`;
    }

    return result;
  }

  function copyPHPStringCode(type = 'blocks') {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);

    navigator.clipboard.writeText(getPHPStringCode(type)).then(() => {
      if (typeLabel === 'Blocks') {
        setCopiedBlocks(true);
      } else if (typeLabel === 'Templates') {
        setCopiedTemplates(true);
      }

      clearTimeout(copiedTimeouts.current[typeLabel]);

      copiedTimeouts.current[typeLabel] = setTimeout(() => {
        if (typeLabel === 'Blocks') {
          setCopiedBlocks(false);
        } else if (typeLabel === 'Templates') {
          setCopiedTemplates(false);
        }
      }, 350);
    });
  }

  function renderExportContent(type = 'blocks') {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
    const nothingSelected =
      Object.keys(disabledStates[`disabled${typeLabel}`]).length === data[type].length;

    return (
      <Fragment>
        <div className="lzb-export-select-items">
          <BaseControl>
            <ToggleControl
              label={__('Select all', 'lazy-blocks')}
              checked={Object.keys(disabledStates[`disabled${typeLabel}`]).length === 0}
              onChange={() => {
                const newDisabled = {};

                // disable all
                if (Object.keys(disabledStates[`disabled${typeLabel}`]).length === 0) {
                  data[type].forEach((item) => {
                    newDisabled[item.data.id] = true;
                  });
                }

                if (typeLabel === 'Blocks') {
                  setDisabledBlocks(newDisabled);
                } else if (typeLabel === 'Templates') {
                  setDisabledTemplates(newDisabled);
                }
              }}
            />
            {data[type].map((item) => {
              const isSelected = !disabledStates[`disabled${typeLabel}`][item.data.id];

              return (
                <ToggleControl
                  key={item.data.id}
                  label={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <Fragment>
                      {type === 'blocks' ? (
                        <Fragment>
                          {item.data.icon && /^dashicons/.test(item.data.icon) ? (
                            <span className={item.data.icon} />
                          ) : (
                            ''
                          )}
                          {item.data.icon && !/^dashicons/.test(item.data.icon) ? (
                            // eslint-disable-next-line react/no-danger
                            <span dangerouslySetInnerHTML={{ __html: item.data.icon }} />
                          ) : (
                            ''
                          )}{' '}
                        </Fragment>
                      ) : (
                        ''
                      )}
                      {item.data.title}
                    </Fragment>
                  }
                  checked={isSelected}
                  onChange={() => {
                    const newDisabled = {
                      // eslint-disable-next-line react/no-access-state-in-setstate
                      ...disabledStates[`disabled${typeLabel}`],
                    };

                    if (isSelected && !newDisabled[item.data.id]) {
                      newDisabled[item.data.id] = true;
                    } else if (!isSelected && typeof newDisabled[item.data.id] !== 'undefined') {
                      delete newDisabled[item.data.id];
                    }

                    if (typeLabel === 'Blocks') {
                      setDisabledBlocks(newDisabled);
                    } else if (typeLabel === 'Templates') {
                      setDisabledTemplates(newDisabled);
                    }
                  }}
                />
              );
            })}
          </BaseControl>
        </div>

        {showStates[`show${typeLabel}PHP`] ? (
          <Fragment>
            <div className="lzb-export-textarea">
              <TextareaControl
                className="lzb-export-code"
                readOnly
                value={getPHPStringCode(type)}
              />
            </div>
            <div className="lzb-export-buttons">
              {/* eslint-disable-next-line react/button-has-type */}
              <button
                className="button"
                onClick={() => {
                  copyPHPStringCode(type);
                }}
              >
                {__('Copy to Clipboard', 'lazy-blocks')}
                {copiedStates[`copied${typeLabel}`] ? <Copied /> : ''}
              </button>
            </div>
          </Fragment>
        ) : (
          <div className="lzb-export-buttons">
            <a
              className="button button-primary"
              disabled={nothingSelected}
              href={getDownloadJSONUrl(type)}
            >
              {__('Export JSON', 'lazy-blocks')}
            </a>
            {/* eslint-disable-next-line react/button-has-type */}
            <button
              className="button"
              onClick={() => {
                if (typeLabel === 'Blocks') {
                  setShowBlocksPHP(true);
                } else if (typeLabel === 'Templates') {
                  setShowTemplatesPHP(true);
                }
              }}
              disabled={nothingSelected}
            >
              {__('Generate PHP', 'lazy-blocks')}
            </button>
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <div className="metabox-holder">
      <div className="postbox-container">
        <div id="normal-sortables">
          <div className="postbox-container">
            <div className="postbox">
              <h2 className="hndle">
                <span>{__('Export Blocks', 'lazy-blocks')}</span>
              </h2>
              {data.blocks && data.blocks.length ? (
                <div className="inside">
                  <p>
                    {__(
                      'Select the blocks you would like to export and then select your export method. Use the download button to export to a .json file which you can then import to another Lazy Blocks installation. Use the generate button to export to PHP code which you can place in your theme.'
                    )}
                  </p>

                  {renderExportContent('blocks')}
                </div>
              ) : (
                <div className="inside">
                  <p>{__('There are no blocks to export.')}</p>
                </div>
              )}
            </div>
            <div className="postbox">
              <h2 className="hndle">
                <span>{__('Export Templates', 'lazy-blocks')}</span>
              </h2>
              {data.templates && data.templates.length ? (
                <div className="inside">
                  <p>
                    {__(
                      'Select the templates you would like to export and then select your export method. Use the download button to export to a .json file which you can then import to another Lazy Blocks installation. Use the generate button to export to PHP code which you can place in your theme.'
                    )}
                  </p>

                  {renderExportContent('templates')}
                </div>
              ) : (
                <div className="inside">
                  <p>{__('There are no templates to export.')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="postbox-container">
            <div className="postbox">
              <h2 className="hndle">
                <span>{__('Import', 'lazy-blocks')}</span>
              </h2>
              <div className="inside">
                <p>
                  {__(
                    'Select the Lazy Blocks JSON file you would like to import. When you click the import button below, Lazy Blocks will import the blocks or templates.'
                  )}
                </p>

                <form method="post" encType="multipart/form-data">
                  <div className="lzb-export-select-items">
                    <input type="file" name="lzb_tools_import_json" />
                  </div>

                  <input type="hidden" name="lzb_tools_import_nonce" value={data.nonce} />

                  <div className="lzb-export-buttons">
                    {/* eslint-disable-next-line react/button-has-type */}
                    <button className="button button-primary">{__('Import', 'lazy-blocks')}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
