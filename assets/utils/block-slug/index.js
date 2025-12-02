/**
 * Default namespace for blocks when not specified.
 */
const DEFAULT_NAMESPACE = 'lazyblock';

/**
 * Adds namespace to slug if not present.
 *
 * @param {string} slug - The block slug, optionally with namespace (e.g., 'my-block' or 'custom/my-block')
 * @return {string} The slug with namespace (e.g., 'lazyblock/my-block' or 'custom/my-block')
 */
export function getSlugWithNamespace(slug) {
	return slug.includes('/') ? slug : `${DEFAULT_NAMESPACE}/${slug}`;
}

/**
 * Gets the block slug with namespace, converting namespace/slug format to namespace-slug.
 * If no namespace is present, defaults to 'lazyblock' namespace.
 *
 * @param {string} slug - The block slug, optionally with namespace (e.g., 'my-block' or 'custom/my-block')
 * @return {string} The normalized slug with namespace using dash (e.g., 'lazyblock-my-block' or 'custom-my-block')
 */
export function getSlugWithNamespaceDash(slug) {
	return getSlugWithNamespace(slug).replace('/', '-');
}

/**
 * Gets the WordPress block class name from the slug.
 *
 * @param {string} slug - The block slug, optionally with namespace
 * @return {string} The block class name (e.g., 'wp-block-lazyblock-my-block')
 */
export function getBlockClassName(slug) {
	return `wp-block-${getSlugWithNamespaceDash(slug)}`;
}

/**
 * Validates if a block slug follows the correct format.
 * Must be lowercase alphanumeric with dashes, starting with a letter.
 * Format: namespace/block-name or just block-name (namespace will be added)
 *
 * @param {string} slug - The block slug to validate
 * @return {boolean} Whether the slug is valid
 */
export function isValidSlug(slug) {
	return /^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/.test(
		getSlugWithNamespace(slug)
	);
}
