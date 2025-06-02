/**
 * Styles.
 */
import './editor.scss';

/**
 * External dependencies.
 */
import HTMLReactParser, { domToReact } from 'html-react-parser';
import json5 from 'json5';

/**
 * WordPress dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { isEqual } from 'lodash';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	InnerBlocks,
	useInnerBlocksProps,
	useBlockProps,
} from '@wordpress/block-editor';

const CONVERT_ATTRIBUTES = {
	classname: 'className',
	allowedblocks: 'allowedBlocks',
	templatelock: 'templateLock',
	prioritizedinserterblocks: 'prioritizedInserterBlocks',
};

const CONVERT_TO_JSON = [
	'allowedBlocks',
	'template',
	'prioritizedInserterBlocks',
];

function RenderScript(props) {
	const { src = '', innerHTML = '', blockContentWrapper } = props;

	useEffect(() => {
		const doc = blockContentWrapper.current?.ownerDocument || document;
		const script = doc.createElement('script');

		if (src) {
			script.src = src;
		}
		if (innerHTML) {
			script.innerHTML = innerHTML;
		}

		doc?.body?.appendChild(script);

		return () => {
			// We have to check if the element is still mounted
			// to prevent unwanted JS errors.
			doc?.body?.removeChild(script);
		};
	}, [blockContentWrapper, src, innerHTML]);
}

/**
 * Prepare JSX attributes.
 *
 * @param {Object} attrs component attributes.
 *
 * @return {Object} - new attributes.
 */
function prepareAttributes(attrs) {
	const newAttrs = { ...attrs };

	Object.keys(CONVERT_ATTRIBUTES).forEach((oldKey) => {
		const newKey = CONVERT_ATTRIBUTES[oldKey];

		if (typeof newAttrs[oldKey] !== 'undefined') {
			delete Object.assign(newAttrs, { [newKey]: newAttrs[oldKey] })[
				oldKey
			];
		}
	});

	// Convert attributes string to json.
	CONVERT_TO_JSON.forEach((name) => {
		if (typeof newAttrs[name] === 'string') {
			const firstChar = newAttrs[name].charAt(0);

			if (firstChar === '[' || firstChar === '{') {
				try {
					newAttrs[name] = json5.parse(newAttrs[name]);
				} catch (e) {
					delete newAttrs[name];
				}
			} else {
				delete newAttrs[name];
			}
		}
	});

	Object.keys(newAttrs).forEach((name) => {
		// Convert attributes to boolean.
		if (newAttrs[name] === 'false') {
			newAttrs[name] = false;
		} else if (newAttrs[name] === 'true') {
			newAttrs[name] = true;

			// Convert class attribute to className.
		} else if (name === 'class') {
			newAttrs.className = newAttrs.className || newAttrs.class;
			delete newAttrs.class;

			// Convert string style attribute to React style object.
		} else if (name === 'style' && typeof newAttrs[name] === 'string') {
			const styleObj = {};
			newAttrs[name].split(';').forEach((declaration) => {
				const [property, value] = declaration
					.split(':')
					.map((s) => s.trim());

				if (property && value) {
					// Convert kebab-case to camelCase
					const camelProperty = property.replace(
						/-([a-z])/g,
						(match, letter) => letter.toUpperCase()
					);
					styleObj[camelProperty] = value;
				}
			});
			newAttrs[name] = styleObj;
		}
	});

	return newAttrs;
}

export default function RenderBlockContent({
	content,
	props,
	blockContentWrapper,
	withBlockProps,
}) {
	const [blockAttrs, setBlockAttrs] = useState({});
	const [innerBlocksOptions, setInnerBlocksOptions] = useState({});

	const { hasChildBlocks } = useSelect(
		(select) => {
			const blockEditor = select('core/block-editor');

			return {
				hasChildBlocks: blockEditor
					? blockEditor.getBlockOrder(props.clientId).length > 0
					: false,
			};
		},
		[props.clientId]
	);

	const blockProps = useBlockProps(withBlockProps ? blockAttrs : undefined);
	const innerBlocksProps = useInnerBlocksProps(
		{
			className: innerBlocksOptions.className || 'lazyblock-inner-blocks',
		},
		{
			...innerBlocksOptions,
			renderAppender: hasChildBlocks
				? undefined
				: InnerBlocks.ButtonBlockAppender,
		}
	);

	function parse(str) {
		let thereIsInnerBlocks = false;

		const options = {
			replace(domNode) {
				// Replace the `innerblocks` component to proper output.
				if (
					domNode.name === 'InnerBlocks' ||
					domNode.name === 'innerblocks'
				) {
					if (thereIsInnerBlocks) {
						// eslint-disable-next-line no-console
						console.warn(
							sprintf(
								// Translators: %s - block slug.
								__(
									'Only a single <InnerBlocks /> component can be used per block. Multiple <InnerBlocks /> found inside block "%s".',
									'lazy-blocks'
								),
								props.block
							)
						);
						return <div />;
					}

					thereIsInnerBlocks = true;

					const newInnerBlockProps = {
						...innerBlocksOptions,
						...prepareAttributes(domNode.attribs),
					};

					if (!isEqual(newInnerBlockProps, innerBlocksOptions)) {
						setInnerBlocksOptions(newInnerBlockProps);
					}

					// Fix elements placed after the self-closing <InnerBlocks /> component.
					// There is a problem with parser, which is not support the self-closing tags
					// and move next elements as children of the self-closing tag.
					if (domNode.children && domNode.children.length) {
						return (
							<>
								<div {...innerBlocksProps} />
								{domToReact(domNode.children, options)}
							</>
						);
					}

					return <div {...innerBlocksProps} />;
				}

				// Handle useBlockProps
				if (domNode.attribs && 'useblockprops' in domNode.attribs) {
					// Get the existing attributes
					const attrs = { ...domNode.attribs };
					delete attrs.useblockprops;

					const newBlockAttrs = {
						...blockAttrs,
						...prepareAttributes(attrs),
					};

					if (!isEqual(newBlockAttrs, blockAttrs)) {
						setBlockAttrs(newBlockAttrs);
					}

					const Tag = domNode.name;

					if (withBlockProps) {
						return (
							<Tag {...blockProps}>
								{domToReact(domNode.children, options)}
							</Tag>
						);
					}

					// If we don't use block props, we need to remove the attributes
					return (
						<Tag {...blockAttrs}>
							{domToReact(domNode.children, options)}
						</Tag>
					);
				}

				// Script element is not working by default, so we should add it manually.
				// @link https://github.com/remarkablemark/html-react-parser/issues/98
				if (domNode.type === 'script') {
					const scriptData = {};

					if (domNode?.attribs?.src) {
						scriptData.src = domNode.attribs.src;
					}
					if (domNode?.children[0]?.data) {
						scriptData.innerHTML = domNode.children[0].data;
					}

					if (typeof blockContentWrapper !== 'undefined') {
						scriptData.blockContentWrapper = blockContentWrapper;
					}

					return <RenderScript {...scriptData} />;
				}
			},
		};

		const result = HTMLReactParser(str, options);

		return result;
	}

	return parse(content);
}
