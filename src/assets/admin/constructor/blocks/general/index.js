import BlockSlugControl from '../../../components/block-slug';
import IconPicker from '../../../components/icon-picker';
import Select from '../../../components/select';

const { __ } = wp.i18n;
const { Component, Fragment } = wp.element;
const { PanelBody, BaseControl, TextareaControl, Notice } = wp.components;

const { compose } = wp.compose;

const { withSelect } = wp.data;

class GeneralSettings extends Component {
  constructor(...args) {
    super(...args);

    this.isSlugValid = this.isSlugValid.bind(this);
  }

  isSlugValid() {
    const { data } = this.props;

    const { slug } = data;

    return /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(`lazyblock/${slug}`);
  }

  render() {
    const { data, updateData, categories } = this.props;

    const { slug, icon, category, description, keywords } = data;

    let thereIsSelectedCat = false;
    const categoriesOpts = categories.map((cat) => {
      if (cat.slug === category) {
        thereIsSelectedCat = true;
      }
      return {
        value: cat.slug,
        label: cat.title,
      };
    });
    if (!thereIsSelectedCat) {
      categoriesOpts.push({
        value: category,
        label: category,
      });
    }

    return (
      <Fragment>
        <PanelBody>
          <BlockSlugControl
            label={__('Slug', '@@text_domain')}
            value={slug}
            onChange={(value) => updateData({ slug: value })}
          />
          {slug && !this.isSlugValid() ? (
            <Notice status="error" isDismissible={false} className="lzb-constructor-notice">
              {__(
                'Block slug must include only lowercase alphanumeric characters or dashes, and start with a letter. Example: lazyblock/my-custom-block',
                '@@text_domain'
              )}
            </Notice>
          ) : (
            ''
          )}
        </PanelBody>
        <PanelBody>
          <IconPicker
            label={__('Icon', '@@text_domain')}
            value={icon}
            onChange={(value) => updateData({ icon: value })}
          />
        </PanelBody>
        <PanelBody>
          <BaseControl label={__('Category', '@@text_domain')}>
            <Select
              isCreatable
              placeholder={__('Select category', '@@text_domain')}
              value={categoriesOpts.filter((option) => option.value === category)}
              options={categoriesOpts}
              onChange={({ value }) => updateData({ category: value })}
            />
          </BaseControl>
        </PanelBody>
        <PanelBody>
          <BaseControl label={__('Keywords', '@@text_domain')}>
            <Select
              isCreatable
              isTags
              placeholder={__(
                'Make it easier to discover a block with keyword aliases',
                '@@text_domain'
              )}
              value={(() => {
                if (keywords) {
                  const result = keywords.split(',').map((val) => ({
                    value: val,
                    label: val,
                  }));
                  return result;
                }
                return [];
              })()}
              onChange={(value) => {
                let result = '';

                if (value) {
                  value.forEach((optionData) => {
                    if (optionData) {
                      if (result) {
                        result += ',';
                      }

                      result += optionData.value;
                    }
                  });
                }

                updateData({ keywords: result });
              }}
            />
          </BaseControl>
        </PanelBody>
        <PanelBody>
          <TextareaControl
            label={__('Description', '@@text_domain')}
            value={description}
            onChange={(value) => updateData({ description: value })}
          />
        </PanelBody>
      </Fragment>
    );
  }
}

export default compose([
  withSelect((select) => {
    const categories = select('core/blocks').getCategories();

    return {
      categories,
    };
  }),
])(GeneralSettings);
