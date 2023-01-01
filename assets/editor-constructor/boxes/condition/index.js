import Select from '../../../components/select';

const { __ } = wp.i18n;
const { useEffect, useState } = wp.element;
const { BaseControl } = wp.components;

const { apiFetch } = wp;

export default function ConditionSettings(props) {
  const { data, updateData } = props;

  const [postTypes, setPostTypes] = useState(false);

  useEffect(() => {
    apiFetch({
      path: '/lazy-blocks/v1/get-post-types/?args[show_ui]=1&output=object',
    }).then((resp) => {
      if (resp && resp.response) {
        const result = {};
        Object.keys(resp.response).forEach((name) => {
          const post = resp.response[name];
          if (
            post.name !== 'lazyblocks' &&
            post.name !== 'lazyblocks_templates' &&
            post.name !== 'attachment'
          ) {
            result[post.name] = post.label;
          }
        });

        setPostTypes(result);
      }
    });
  }, []);

  const { condition_post_types: conditionPostTypes } = data;

  return postTypes ? (
    <BaseControl label={__('Show in posts', 'lazy-blocks')}>
      <Select
        isMulti
        placeholder={__('In all posts by default', 'lazy-blocks')}
        options={Object.keys(postTypes).map((type) => ({
          value: type,
          label: postTypes[type],
        }))}
        value={(() => {
          if (conditionPostTypes && conditionPostTypes.length) {
            const result = conditionPostTypes.map((val) => ({
              value: val,
              label: postTypes[val] || val,
            }));
            return result;
          }
          return [];
        })()}
        onChange={(value) => {
          if (value) {
            const result = [];

            value.forEach((optionData) => {
              result.push(optionData.value);
            });

            updateData({ condition_post_types: result });
          } else {
            updateData({ condition_post_types: '' });
          }
        }}
      />
    </BaseControl>
  ) : (
    __('Loading...', 'lazy-blocks')
  );
}
