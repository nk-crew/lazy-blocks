import { useCallback, useMemo } from '@wordpress/element';
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
	}, []);

	const flattenBlocks = useCallback((blocks) => {
		if (!blocks?.length) {
			return [];
		}

		const result = [];

		blocks.forEach((data) => {
			result.push(data);

			if (data.innerBlocks?.length) {
				result.push(...flattenBlocks(data.innerBlocks));
			}
		});

		return result;
	}, []);

	return useMemo(() => flattenBlocks(allBlocks), [allBlocks, flattenBlocks]);
}

export default useAllBlocks;
