/* eslint-disable indent */
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { BaseControl, ToggleControl } from '@wordpress/components';

/**
 * Internal dependencies.
 */
import Select from '../../../components/select';

export default function SupportsSettings(props) {
	const { data, updateData } = props;

	const {
		supports_multiple: supportsMultiple,
		supports_classname: supportsClassname,
		supports_anchor: supportsAnchor,
		supports_inserter: supportsInserter,
		supports_reusable: supportsReusable,
		supports_lock: supportsLock,
		supports_align: supportsAlign,
	} = data;

	return (
		<>
			<ToggleControl
				label={__('Multiple', 'lazy-blocks')}
				help={__(
					'Allow use block multiple times on the page.',
					'lazy-blocks'
				)}
				checked={supportsMultiple}
				onChange={(value) => updateData({ supports_multiple: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Class Name', 'lazy-blocks')}
				help={__(
					'Additional field to add custom class name.',
					'lazy-blocks'
				)}
				checked={supportsClassname}
				onChange={(value) => updateData({ supports_classname: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Anchor', 'lazy-blocks')}
				help={__(
					'Additional field to add block ID attribute.',
					'lazy-blocks'
				)}
				checked={supportsAnchor}
				onChange={(value) => updateData({ supports_anchor: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Inserter', 'lazy-blocks')}
				help={__('Show block in blocks inserter.', 'lazy-blocks')}
				checked={supportsInserter}
				onChange={(value) => updateData({ supports_inserter: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Reusable', 'lazy-blocks')}
				help={__(
					'Allow converting block into reusable block.',
					'lazy-blocks'
				)}
				checked={supportsReusable}
				onChange={(value) => updateData({ supports_reusable: value })}
				__nextHasNoMarginBottom
			/>
			<ToggleControl
				label={__('Lock', 'lazy-blocks')}
				help={__(
					'Allow block locking/unlocking by a user.',
					'lazy-blocks'
				)}
				checked={supportsLock}
				onChange={(value) => updateData({ supports_lock: value })}
				__nextHasNoMarginBottom
			/>
			<BaseControl
				id="lazyblocks-supports-align"
				label={__('Align', 'lazy-blocks')}
				__nextHasNoMarginBottom
			>
				<Select
					id="lazyblocks-supports-align"
					isMulti
					placeholder={__('Select align options', 'lazy-blocks')}
					options={['wide', 'full', 'left', 'center', 'right'].map(
						(alignName) => ({
							value: alignName,
							label: alignName,
						})
					)}
					value={(() => {
						if (supportsAlign && supportsAlign.length) {
							const result = supportsAlign
								.filter((val) => val !== 'none')
								.map((val) => ({
									value: val,
									label: val,
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

							updateData({ supports_align: result });
						} else {
							updateData({ supports_align: ['none'] });
						}
					}}
				/>
			</BaseControl>
		</>
	);
}
