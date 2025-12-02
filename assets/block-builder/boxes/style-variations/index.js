/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import Choices from '../../../components/choices';

export default function StyleVariationsSettings(props) {
	const { data, updateData } = props;
	const { styles } = data;

	return (
		<Choices
			label={null}
			labelAddChoice={__('+ Add Style Variation', 'lazy-blocks')}
			help={
				!!styles.length &&
				__(
					'Add the style variation name, which will be used as a class name on your block. For example, if you add a style variation with the name `outline`, when a user selects this style, the class name `is-style-outline` will be added to the block.',
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
