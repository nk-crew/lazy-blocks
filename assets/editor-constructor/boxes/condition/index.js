/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { BaseControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies.
 */
import Select from '../../../components/select';

export default function ConditionSettings(props) {
	const { data, updateData } = props;

	const [postTypes, setPostTypes] = useState(false);

	useEffect(() => {
		let isMounted = true;
		const controller =
			typeof AbortController === 'undefined'
				? undefined
				: new AbortController();

		apiFetch({
			path: '/lazy-blocks/v1/get-post-types/?args[show_ui]=1&output=object',
			signal: controller?.signal,
		})
			.then((resp) => {
				if (isMounted && resp && resp.response) {
					const result = {};
					Object.keys(resp.response).forEach((name) => {
						const post = resp.response[name];

						if (
							![
								'lazyblocks',
								'lazyblocks_templates',
								'attachment',
								'wp_block',
								'wp_navigation',
								'ghostkit_template',
							].includes(post.name)
						) {
							result[post.name] = post.label;
						}
					});

					setPostTypes(result);
				}
			})
			.catch(() => {});

		// Cleanup.
		return () => {
			isMounted = false;
			controller?.abort();
		};
	}, []);

	const { condition_post_types: conditionPostTypes } = data;

	return postTypes ? (
		<BaseControl
			id="lazyblocks-boxes-condition-posts"
			label={__('Show in posts', 'lazy-blocks')}
			__nextHasNoMarginBottom
		>
			<Select
				id="lazyblocks-boxes-condition-posts"
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
		__('Loading…', 'lazy-blocks')
	);
}
