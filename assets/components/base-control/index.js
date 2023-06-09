// External Dependencies
import classnames from 'classnames/dedupe';

// Import CSS
import './editor.scss';

// The reason why we created this component is simple.
// Our controls support the HTML in the control `help` attributes
// but it conflicts with Gutenberg, since help is wrapped to <p> tag.
export default function BaseControl(props) {
	const { label, help, className, children, ...allProps } = props;

	return (
		<div
			{...allProps}
			className={classnames(
				'lazyblocks-component-base-control',
				className
			)}
		>
			{label ? (
				<div className="lazyblocks-component-base-control__label">
					{label}
				</div>
			) : null}
			{children}
			{help ? (
				<div className="lazyblocks-component-base-control__help">
					{help}
				</div>
			) : null}
		</div>
	);
}
