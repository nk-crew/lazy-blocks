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

export default function BlockSlug(props) {
	return (
		<BaseControl
			id={props.label}
			label={props.label || ''}
			__nextHasNoMarginBottom
		>
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
							lazyblock
							<span>/</span>
						</Button>
					)}
					renderContent={() => (
						<div className="lazyblocks-component-pro-notice">
							Custom block collections and slug namespaces are
							only available in the Pro plugin.
							{window?.lazyblocksBlockBuilderData?.pro_url && (
								<a
									className="lazyblocks-component-pro-notice-btn"
									target="_blank"
									rel="noreferrer"
									href={
										window.lazyblocksBlockBuilderData
											.pro_url
									}
								>
									{__('Upgrade Now', 'lazy-blocks')}
								</a>
							)}
						</div>
					)}
				/>
				<TextControl
					{...{
						...props,
						...{ label: '' },
					}}
					__next40pxDefaultSize
					__nextHasNoMarginBottom
				/>
			</div>
		</BaseControl>
	);
}
