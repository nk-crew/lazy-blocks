/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { PanelBody, TextControl, Notice } from '@wordpress/components';

function checkNameSlug(slug) {
	return /^[A-Za-z0-9-_]*$/.test(slug);
}

export default function NameRow(props) {
	const [isNameValid, setIsNameValid] = useState(true);

	const { updateData, data } = props;

	const { name = '' } = data;

	useEffect(() => {
		const isValid = checkNameSlug(name);

		if (isValid !== isNameValid) {
			setIsNameValid(isValid);
		}
	}, [isNameValid, name]);

	return (
		<PanelBody>
			<TextControl
				label={__('Name', 'lazy-blocks')}
				value={name}
				onChange={(value) => updateData({ name: value })}
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			/>
			{!isNameValid ? (
				<Notice
					status="error"
					isDismissible={false}
					className="lzb-block-builder-notice"
				>
					{__(
						'Control name must include only alphanumeric characters, dashes or underscores. Example: my-control-name',
						'lazy-blocks'
					)}
				</Notice>
			) : (
				''
			)}
		</PanelBody>
	);
}
