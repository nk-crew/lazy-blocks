/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import {
	BaseControl,
	Button,
	TextControl,
	Dropdown,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

const { lazyblocksConstructorData } = window;

export default function BlockSlug(props) {
	return (
		<BaseControl id={props.label} label={props.label || ''}>
			<div className="lazyblocks-component-block-slug">
				<Dropdown
					className="lazyblocks-component-block-slug-prefix-dropdown"
					contentClassName="lazyblocks-component-block-slug-prefix-dropdown-content"
					popoverProps={{
						placement: 'left-start',
						offset: 36,
						shift: true,
					}}
					renderToggle={({ isOpen, onToggle }) => (
						<Button
							className="lazyblocks-component-block-slug-prefix"
							aria-expanded={isOpen}
							onClick={onToggle}
						>
							<span>lazyblock</span>
							<span>/</span>
						</Button>
					)}
					renderContent={() => (
						<div className="lazyblocks-component-pro-notice">
							Custom block slugs and collections are only
							available in the Pro plugin.
							<a
								className="lazyblocks-component-pro-notice-btn"
								target="_blank"
								rel="noreferrer"
								href={lazyblocksConstructorData.pro_url}
							>
								{__('Upgrade Now', 'lazy-blocks')}
							</a>
						</div>
					)}
				/>
				<TextControl
					{...{
						...props,
						...{ label: '' },
					}}
				/>
			</div>
		</BaseControl>
	);
}
