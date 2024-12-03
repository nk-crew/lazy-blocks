import './editor.scss';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback, useRef } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { useThrottle } from '@wordpress/compose';
import apiFetch from '@wordpress/api-fetch';

export default function CodePreview(props) {
	const { data, codeContext } = props;

	const [codePreview, setCodePreview] = useState('');

	const isMountedRef = useRef(true);
	const iframeRef = useRef();
	const iframeObserver = useRef();

	const getAttributes = useCallback(() => {
		const result = {};

		if (data.controls) {
			Object.values(data.controls).forEach((control) => {
				if (control.name && !control.child_of) {
					result[control.name] = control.default;
				}
			});
		}
		return result;
	}, [data]);

	function setIframeContents() {
		return `
      <link rel="stylesheet" href="/wp-admin/load-styles.php?load[chunk_0]=common,media,themes" type="text/css" media="all" />
      <style>
          html {
              height: auto;
          }
          body {
              background: #fff !important;
              overflow: auto;
          }
      </style>
      ${codePreview}
    `;
	}

	function setIframeHeight() {
		const iframe = iframeRef.current;

		if (iframe.contentDocument.documentElement) {
			// Pick the maximum of these two values to account for margin collapsing.
			const height = Math.max(
				iframe.contentDocument.documentElement.offsetHeight,
				iframe.contentDocument.body.offsetHeight
			);

			iframe.style.height = `${height}px`;
		}
	}

	function calculateIframeHeight(iframe) {
		if (!iframe) {
			return;
		}

		iframeRef.current = iframe;

		const { IntersectionObserver } = iframe.ownerDocument.defaultView;

		// Observe for intersections that might cause a change in the height of
		// the iframe, e.g. a Widget Area becoming expanded.
		iframeObserver.current = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIframeHeight();
				}
			},
			{
				threshold: 1,
			}
		);
		iframeObserver.current.observe(iframe);

		iframe.addEventListener('load', setIframeHeight);
	}

	const loadPreview = (loadData, attributes, loadCodeContext) => {
		if (!loadData) {
			return;
		}
		if (!isMountedRef.current) {
			return;
		}

		apiFetch({
			path: 'lazy-blocks/v1/block-builder-preview',
			method: 'POST',
			data: {
				context: loadCodeContext,
				attributes,
				block: loadData,
			},
		})
			.then(({ response, error, error_code: errorCode }) => {
				if (!isMountedRef.current) {
					return;
				}

				if (error) {
					if (errorCode === 'lazy_block_no_render_callback') {
						setCodePreview('');
					} else {
						setCodePreview(`<pre>${response}</pre>`);
					}
				} else {
					setCodePreview(response);
				}
			})
			.catch(() => {
				if (!isMountedRef.current) {
					return;
				}

				setCodePreview(
					__('Error: Could not generate the preview.', 'lazy-blocks')
				);
			});
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const loadPreviewThrottle = useCallback(useThrottle(loadPreview, 2000), []);

	// Unmount.
	useEffect(() => {
		const $frameObserver = iframeObserver.current;
		const $frame = iframeRef.current;

		isMountedRef.current = true;

		return () => {
			$frameObserver.disconnect();
			$frame.removeEventListener('load', setIframeHeight);

			// When the component unmounts, set isMountedRef to false. This will
			// let the async fetch callbacks know when to stop.
			isMountedRef.current = false;
		};
	}, []);

	// Load preview data after change.
	useEffect(() => {
		const attributes = getAttributes();

		loadPreviewThrottle(data, attributes, codeContext);
	}, [data, codeContext, getAttributes, loadPreviewThrottle]);

	return (
		<div className="lzb-block-builder-code-preview">
			<PanelBody>
				<h2>{__('Preview', 'lazy-blocks')}</h2>
			</PanelBody>
			<PanelBody>
				<iframe
					srcDoc={setIframeContents()}
					ref={calculateIframeHeight}
					frameBorder="0"
					title="code-preview"
				/>
			</PanelBody>
		</div>
	);
}
