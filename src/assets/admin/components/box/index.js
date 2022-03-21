// Import CSS
import './editor.scss';

/**
 * External dependencies
 */
import classnames from 'classnames/dedupe';

export default function Box({ 'no-paddings': noPaddings, children }) {
  return (
    <div
      className={classnames(
        'lazyblocks-component-box',
        noPaddings ? 'lazyblocks-component-box-no-paddings' : ''
      )}
    >
      {children}
    </div>
  );
}
