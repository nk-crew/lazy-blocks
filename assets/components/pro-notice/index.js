/**
 * Styles.
 */
import './editor.scss';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { PanelBody, BaseControl } from '@wordpress/components';

const { lazyblocksBlockBuilderData } = window;

export default function ProNotice() {
	if (lazyblocksBlockBuilderData.is_pro) {
		return null;
	}

	return (
		<PanelBody>
			<BaseControl
				id="lazyblocks-pro-notice"
				label={__('Lazy Blocks Pro', 'lazy-blocks')}
				className="lazyblocks-component-pro-notice"
				__nextHasNoMarginBottom
			>
				<div>
					<a
						className="lazyblocks-component-pro-notice-btn"
						target="_blank"
						rel="noreferrer"
						href={lazyblocksBlockBuilderData.pro_url}
					>
						{__('Upgrade Now', 'lazy-blocks')}
					</a>
					<ul className="ul-square">
						<li>
							{__(
								'Custom block collections and slug namespaces',
								'lazy-blocks'
							)}
						</li>
						<li>
							{__('Controls Conditional Logic', 'lazy-blocks')}
						</li>
						<li>{__('Panels and Dividers', 'lazy-blocks')}</li>
						<li>
							{__(
								'Posts, Taxonomy, User Controls',
								'lazy-blocks'
							)}
						</li>
						<li>{__('Blocks Preloading', 'lazy-blocks')}</li>
						<li>{__('SEO Enhancements', 'lazy-blocks')}</li>
						<li>
							<a
								target="_blank"
								rel="noreferrer"
								href={lazyblocksBlockBuilderData.pro_url}
							>
								{__('And much more…', 'lazy-blocks')}
							</a>
						</li>
					</ul>
				</div>
			</BaseControl>
		</PanelBody>
	);
}
