/**
 * TinyMCE Component from https://github.com/WordPress/gutenberg/blob/trunk/packages/block-library/src/freeform/modal.js
 * With changes to work as control.
 */

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { Button, Flex, FlexItem } from '@wordpress/components';

import Modal from '../../assets/components/modal';

function ClassicEdit(props) {
	const styles = useSelect(
		(select) => select('core/block-editor').getSettings().styles
	);
	useEffect(() => {
		const { baseURL, suffix, settings } = window.wpEditorL10n.tinymce;

		window.tinymce.EditorManager.overrideDefaults({
			base_url: baseURL,
			suffix,
		});

		window.wp.oldEditor.initialize(props.id, {
			tinymce: {
				...settings,
				setup(editor) {
					editor.on('init', () => {
						const doc = editor.getDoc();
						styles.forEach(({ css }) => {
							const styleEl = doc.createElement('style');
							styleEl.innerHTML = css;
							doc.head.appendChild(styleEl);
						});
					});
				},
			},
		});

		return () => {
			window.wp.oldEditor.remove(props.id);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return <textarea {...props} />;
}

export default function ModalEdit(props) {
	const { label, editorId, content, onChange } = props;

	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div />
			<Button onClick={() => setIsOpen(!isOpen)} variant="secondary">
				{__('Open Editor', 'lazy-blocks')}
			</Button>
			{isOpen ? (
				<Modal
					title={label || __('Editor', 'lazy-blocks')}
					onRequestClose={() => setIsOpen(!isOpen)}
					id={`modal-${editorId}`}
					className="lazyblocks-control-classic_editor-modal"
					shouldCloseOnClickOutside={false}
				>
					<ClassicEdit id={editorId} defaultValue={content} />
					<Flex
						className="block-editor-freeform-modal__actions"
						justify="flex-end"
						expanded={false}
					>
						<FlexItem>
							<Button
								variant="tertiary"
								onClick={() => setIsOpen(false)}
							>
								{__('Cancel', 'lazy-blocks')}
							</Button>
						</FlexItem>
						<FlexItem>
							<Button
								variant="primary"
								onClick={() => {
									onChange(
										window.wp.oldEditor.getContent(editorId)
									);
									setIsOpen(false);
								}}
							>
								{__('Save', 'lazy-blocks')}
							</Button>
						</FlexItem>
					</Flex>
				</Modal>
			) : null}
		</>
	);
}
