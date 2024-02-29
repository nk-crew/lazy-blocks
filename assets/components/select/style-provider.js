/*
 * Add style provider to fix styles render inside the editor iframe.
 * thanks to https://github.com/WordPress/gutenberg/issues/38226#issuecomment-1492422260
 *
 * This is a copy of Gutenberg component
 * https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/style-provider/index.tsx
 */
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import * as uuid from 'uuid';

import { useRef } from '@wordpress/element';

const uuidCache = new Set();
// Use a weak map so that when the container is detached it's automatically
// dereferenced to avoid memory leak.
const containerCacheMap = new WeakMap();

const memoizedCreateCacheWithContainer = (container) => {
	if (containerCacheMap.has(container)) {
		return containerCacheMap.get(container);
	}

	// Emotion only accepts alphabetical and hyphenated keys so we just
	// strip the numbers from the UUID. It _should_ be fine.
	let key = uuid.v4().replace(/[0-9]/g, '');
	while (uuidCache.has(key)) {
		key = uuid.v4().replace(/[0-9]/g, '');
	}
	uuidCache.add(key);

	const cache = createCache({ container, key });
	containerCacheMap.set(container, cache);
	return cache;
};

function StyleProvider(props) {
	const { children, document } = props;

	if (!document) {
		return null;
	}

	const cache = memoizedCreateCacheWithContainer(document.head);

	return <CacheProvider value={cache}>{children}</CacheProvider>;
}

export default function StyleProviderWrapper(props) {
	const { children } = props;

	const ref = useRef();

	return (
		<>
			<link ref={ref} />
			<StyleProvider document={ref?.current?.ownerDocument || document}>
				{children}
			</StyleProvider>
		</>
	);
}
