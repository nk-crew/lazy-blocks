// Import CSS
import './editor.scss';

const { __ } = wp.i18n;

export default function Copied({ children }) {
  return (
    <div className="lazyblocks-component-copied">{children || __('Copied!', 'lazy-blocks')}</div>
  );
}
