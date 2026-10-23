/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { Button, ExternalLink, Path, SVG } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const { lazyblocksBlockBuilderData } = window;

const closeIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z" />
	</SVG>
);

/**
 * One line about Lazy Blocks Pro. Dismissing it is stored in the user
 * preferences, so it stays hidden on every block.
 */
export default function ProNotice() {
	const isDismissed = useSelect(
		(select) =>
			!!select('core/preferences').get(
				'lazy-blocks',
				'proNoticeDismissed'
			),
		[]
	);
	const { set: setPreference } = useDispatch('core/preferences');

	if (lazyblocksBlockBuilderData.is_pro || isDismissed) {
		return null;
	}

	return (
		<div className="lazyblocks-component-pro-notice-line">
			<p>
				{__(
					'Lazy Blocks Pro adds conditional logic, panels, and post, taxonomy and user controls.',
					'lazy-blocks'
				)}{' '}
				<ExternalLink href={lazyblocksBlockBuilderData.pro_url}>
					{__('Learn more', 'lazy-blocks')}
				</ExternalLink>
			</p>
			<Button
				size="small"
				icon={closeIcon}
				label={__('Dismiss', 'lazy-blocks')}
				onClick={() =>
					setPreference('lazy-blocks', 'proNoticeDismissed', true)
				}
			/>
		</div>
	);
}
