/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import ComponentChoices from '../../../../controls/select/component-choices';

export default function StylesSettings(props) {
	const { data, updateData } = props;
	const { styles } = data;

	return (
		<ComponentChoices
			label={null}
			labelAddChoice={__('+ Add Style', 'lazy-blocks')}
			help={
				!!styles.length &&
				__(
					'Add the style name, which will be used as class name on your block. For example, if you add the style with name `outline`, when user select this style, on the block will be added class name `is-style-outline`',
					'lazy-blocks'
				)
			}
			value={styles}
			onChange={(val) => updateData({ styles: val })}
			options={[
				{
					name: 'name',
					label: __('Name', 'lazy-blocks'),
				},
				{
					name: 'label',
					label: __('Label', 'lazy-blocks'),
				},
			]}
		/>
	);
}
