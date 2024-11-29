import { useCallback } from '@wordpress/element';
import { useSelect } from '@wordpress/data';

/**
 * Custom hook to get all blocks recursively.
 *
 * @return {Function} Function to get all blocks.
 */
function useAllBlocks() {
	const { allBlocks } = useSelect((select) => {
		const { getBlocks } = select('core/block-editor');

		return {
			allBlocks: getBlocks(),
		};
	});

	const getAllBlocks = useCallback(
		(blocks = false) => {
			let result = [];

			if (!blocks) {
				blocks = allBlocks;
			}

			if (!blocks) {
				return result;
			}

			blocks.forEach((data) => {
				result.push(data);

				if (data.innerBlocks && data.innerBlocks.length) {
					result = [...result, ...getAllBlocks(data.innerBlocks)];
				}
			});

			return result;
		},
		[allBlocks]
	);

	return getAllBlocks();
}

export default useAllBlocks;
