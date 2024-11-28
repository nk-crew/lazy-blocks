import { registerPlugin } from '@wordpress/plugins';
import RemoveBlockWithSavedMeta from './remove-block-with-saved-post-meta';

registerPlugin('lazyblocks-remove-block-with-saved-meta', {
	render: RemoveBlockWithSavedMeta,
});
