/**
 * Styles.
 */
import './editor.scss';

import classnames from 'classnames/dedupe';

/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import {
	BaseControl,
	SelectControl,
	ToggleControl,
	Button,
	TabPanel,
	Notice,
	Dropdown,
} from '@wordpress/components';

/**
 * Internal dependencies.
 */
import CodeEditor from './component-react-ace';
import Box from '../../../components/box';
import Select from '../../../components/select';

const {
	plugin_version: pluginVersion,
	wp_content_dir: wpContentDir,
	is_pro: isPro,
} = window.lazyblocksBlockBuilderData;

const icons = {
	html: (
		<svg
			width="17"
			height="18"
			viewBox="0 0 17 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M2.6438 15.0938L1.5 2.50158L15.2583 2.5L14.103 15.1042L8.37861 16.249L2.6438 15.0938Z"
				fill="#E65100"
			/>
			<path
				d="M4.27343 9.95572L3.78662 4.78806L12.9646 4.78625L12.8038 6.51786L5.65078 6.51754L5.84754 8.23663L12.6514 8.22628L12.175 13.5803L8.3744 14.5331L4.57376 13.5907L4.32521 11.1052L6.06502 11.0845L6.14786 12.2444L8.39511 12.6793L10.5699 12.2651L10.7252 9.96608L4.27343 9.95572Z"
				fill="white"
			/>
		</svg>
	),
	js: (
		<svg
			width="17"
			height="18"
			viewBox="0 0 17 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="1.5"
				y="2"
				width="14.3"
				height="14.3"
				rx="1"
				fill="#FFCA28"
			/>
			<path
				d="M7.83523 9.18182H9.05114V13.2386C9.05114 13.6136 8.96686 13.9394 8.7983 14.2159C8.63163 14.4924 8.39962 14.7055 8.10227 14.8551C7.80492 15.0047 7.45928 15.0795 7.06534 15.0795C6.71496 15.0795 6.39678 15.018 6.1108 14.8949C5.8267 14.7699 5.60133 14.5805 5.43466 14.3267C5.26799 14.071 5.18561 13.75 5.1875 13.3636H6.41193C6.41572 13.517 6.44697 13.6487 6.50568 13.7585C6.56629 13.8665 6.64867 13.9498 6.75284 14.0085C6.8589 14.0653 6.9839 14.0938 7.12784 14.0938C7.27936 14.0938 7.4072 14.0616 7.51136 13.9972C7.61742 13.9309 7.69792 13.8343 7.75284 13.7074C7.80777 13.5805 7.83523 13.4242 7.83523 13.2386V9.18182ZM13.2244 10.8551C13.2017 10.6259 13.1042 10.4479 12.9318 10.321C12.7595 10.1941 12.5256 10.1307 12.2301 10.1307C12.0294 10.1307 11.8598 10.1591 11.7216 10.2159C11.5833 10.2708 11.4773 10.3475 11.4034 10.446C11.3314 10.5445 11.2955 10.6562 11.2955 10.7812C11.2917 10.8854 11.3134 10.9763 11.3608 11.054C11.41 11.1316 11.4773 11.1989 11.5625 11.2557C11.6477 11.3106 11.7462 11.3589 11.858 11.4006C11.9697 11.4403 12.089 11.4744 12.2159 11.5028L12.7386 11.6278C12.9924 11.6847 13.2254 11.7604 13.4375 11.8551C13.6496 11.9498 13.8333 12.0663 13.9886 12.2045C14.1439 12.3428 14.2642 12.5057 14.3494 12.6932C14.4366 12.8807 14.4811 13.0956 14.483 13.3381C14.4811 13.6941 14.3902 14.0028 14.2102 14.2642C14.0322 14.5237 13.7746 14.7254 13.4375 14.8693C13.1023 15.0114 12.6979 15.0824 12.2244 15.0824C11.7547 15.0824 11.3456 15.0104 10.9972 14.8665C10.6506 14.7225 10.3797 14.5095 10.1847 14.2273C9.99148 13.9432 9.89015 13.5919 9.88068 13.1733H11.071C11.0843 13.3684 11.1402 13.5312 11.2386 13.6619C11.339 13.7907 11.4725 13.8883 11.6392 13.9545C11.8078 14.0189 11.9981 14.0511 12.2102 14.0511C12.4186 14.0511 12.5994 14.0208 12.7528 13.9602C12.9081 13.8996 13.0284 13.8153 13.1136 13.7074C13.1989 13.5994 13.2415 13.4754 13.2415 13.3352C13.2415 13.2045 13.2027 13.0947 13.125 13.0057C13.0492 12.9167 12.9375 12.8409 12.7898 12.7784C12.6439 12.7159 12.465 12.6591 12.2528 12.608L11.6193 12.4489C11.1288 12.3295 10.7415 12.143 10.4574 11.8892C10.1733 11.6354 10.0322 11.2936 10.0341 10.8636C10.0322 10.5114 10.1259 10.2036 10.3153 9.94034C10.5066 9.67708 10.7689 9.47159 11.1023 9.32386C11.4356 9.17614 11.8144 9.10227 12.2386 9.10227C12.6705 9.10227 13.0473 9.17614 13.3693 9.32386C13.6932 9.47159 13.9451 9.67708 14.125 9.94034C14.3049 10.2036 14.3977 10.5085 14.4034 10.8551H13.2244Z"
				fill="black"
			/>
		</svg>
	),
	css: (
		<svg
			width="17"
			height="18"
			viewBox="0 0 17 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M15.98 2L13.9474 12.5188L13.7595 13.4583L11.0607 14.3578L9.19317 14.9823L6.88724 15.75L1 13.487L1.67185 10.0208H4.06318L3.81266 11.6536L7.42244 13.0401L7.86654 12.8911L11.5788 11.6536L11.6756 11.1781L12.1254 8.875H1.8939L2.31523 6.72083L2.3437 6.58333H12.5695L13.0136 4.29167H2.78211L3.22622 2H15.98Z"
				fill="#42A5F5"
			/>
		</svg>
	),
	php: (
		<svg
			width="18"
			height="18"
			viewBox="0 0 18 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<rect
				x="2"
				y="2"
				width="14.3"
				height="14.3"
				rx="1"
				fill="#4F5B93"
			/>
			<path
				d="M8.12211 5.625H9.06711L8.80003 7.04486H9.64918C10.1149 7.05482 10.4618 7.15888 10.6901 7.35711C10.9229 7.55527 10.9914 7.93204 10.8956 8.48706L10.4367 10.9625H9.47801L9.91625 8.59854C9.96187 8.35071 9.9482 8.17481 9.87519 8.07075C9.80218 7.96669 9.64468 7.91466 9.40269 7.91466L8.64253 7.90723L8.08099 10.9625H7.13599L8.12211 5.625Z"
				fill="white"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M3.79177 7.04492H5.62703C6.16568 7.04982 6.55605 7.2184 6.79804 7.55038C7.04003 7.88243 7.1199 8.33586 7.03772 8.91079C7.00583 9.17353 6.93501 9.43116 6.82543 9.68395C6.72041 9.93668 6.57439 10.1646 6.38719 10.3678C6.15887 10.6255 5.91463 10.789 5.65442 10.8585C5.3942 10.9279 5.1248 10.9626 4.84636 10.9626H4.0246L3.76437 12.375H2.8125L3.79177 7.04492ZM4.1821 10.1225L4.59161 7.89981H4.72994C4.78021 7.89981 4.83266 7.89728 4.88745 7.89238C5.25272 7.88743 5.55623 7.92462 5.79825 8.00387C6.04474 8.08313 6.12692 8.383 6.04474 8.90337C5.94439 9.5229 5.74796 9.88465 5.45583 9.98871C5.16369 10.0879 4.79842 10.1349 4.36015 10.13H4.26428C4.23689 10.13 4.2095 10.1274 4.1821 10.1225Z"
				fill="white"
			/>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M13.7454 7.04492H11.9102L10.9309 12.375H11.8828L12.143 10.9626H12.9648C13.2432 10.9626 13.5126 10.9279 13.7728 10.8585C14.0331 10.789 14.2773 10.6255 14.5056 10.3678C14.6928 10.1646 14.8388 9.93668 14.9438 9.68395C15.0534 9.43116 15.1242 9.17353 15.1561 8.91079C15.2383 8.33586 15.1585 7.88243 14.9164 7.55038C14.6745 7.2184 14.2841 7.04982 13.7454 7.04492ZM12.71 7.89981L12.3005 10.1225C12.3279 10.1274 12.3553 10.13 12.3827 10.13H12.4786C12.9169 10.1349 13.2821 10.0879 13.5743 9.98871C13.8664 9.88465 14.0628 9.5229 14.1632 8.90337C14.2454 8.383 14.1632 8.08313 13.9167 8.00387C13.6747 7.92462 13.3711 7.88743 13.0059 7.89238C12.9511 7.89728 12.8986 7.89981 12.8484 7.89981H12.71Z"
				fill="white"
			/>
		</svg>
	),
	wp: (
		<svg
			width="17"
			height="18"
			viewBox="0 0 17 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M8.485 1.75C4.497 1.75 1.25 4.99408 1.25 8.985C1.25 12.973 4.497 16.22 8.485 16.22C12.473 16.22 15.72 12.973 15.72 8.985C15.72 4.99408 12.473 1.75 8.485 1.75ZM1.97933 8.985C1.97933 8.0427 2.18063 7.14708 2.54238 6.33897L5.64643 14.8401C3.47593 13.784 1.97933 11.5581 1.97933 8.985ZM8.485 15.4907C7.8461 15.4907 7.23054 15.3973 6.64708 15.2252L8.59878 9.55388L10.5972 15.0326C10.6117 15.0647 10.6263 15.0939 10.6438 15.1231C9.96993 15.3594 9.24351 15.4907 8.485 15.4907ZM9.38062 5.93638C9.77155 5.91596 10.1245 5.87512 10.1245 5.87512C10.4746 5.83427 10.4338 5.31791 10.0837 5.33833C10.0837 5.33833 9.03054 5.42001 8.3508 5.42001C7.71191 5.42001 6.63832 5.33833 6.63832 5.33833C6.28824 5.31791 6.2474 5.8547 6.59748 5.87512C6.59748 5.87512 6.93006 5.91596 7.28014 5.93638L8.29246 8.71369L6.86879 12.9818L4.49992 5.93638C4.89084 5.91596 5.24384 5.87512 5.24384 5.87512C5.59392 5.83427 5.55307 5.31791 5.20299 5.33833C5.20299 5.33833 4.14983 5.42001 3.47009 5.42001C3.34757 5.42001 3.20462 5.41709 3.05 5.41126C4.21402 3.64627 6.21239 2.47933 8.485 2.47933C10.1771 2.47933 11.7203 3.12698 12.8785 4.18598C12.8493 4.18306 12.8231 4.18014 12.7939 4.18014C12.155 4.18014 11.7028 4.73735 11.7028 5.33541C11.7028 5.8722 12.0121 6.32439 12.3417 6.86118C12.5897 7.29294 12.8785 7.85016 12.8785 8.65534C12.8785 9.21255 12.6655 9.85728 12.3826 10.7587L11.7349 12.9263L9.38062 5.93638ZM11.7553 14.6067L13.742 8.86247C14.1125 7.93476 14.238 7.19375 14.238 6.53152C14.238 6.2923 14.2234 6.07058 14.1942 5.86345C14.7018 6.79116 14.9907 7.85307 14.9907 8.985C14.9907 11.386 13.6895 13.4806 11.7553 14.6067Z"
				fill="#3858E9"
			/>
		</svg>
	),
};

const proStylesComment = `/**
 * ⭐ Style Editor - Pro Feature ⭐
 *
 * Custom CSS styling is available exclusively in the Lazy Blocks Pro.
 *
 * Upgrade to Lazy Blocks Pro to:
 * - Add custom CSS styles to your blocks
 * - Create responsive designs with media queries
 * - Style block elements with precision
 * - Access advanced styling options
 *
 * Learn more at: https://www.lazyblocks.com/pro/
 **/`;

const proScriptComment = `/**
 * ⭐ JavaScript Editor - Pro Feature ⭐
 *
 * Custom JavaScript functionality is available exclusively in the Lazy Blocks Pro.
 *
 * Upgrade to Lazy Blocks Pro to:
 * - Add custom JavaScript to enhance your blocks
 * - Create interactive elements and animations
 * - Implement advanced block behaviors
 * - Access event handling and DOM manipulation features
 *
 * Learn more at: https://www.lazyblocks.com/pro/
 **/`;

/**
 * Adds an appropriate icon to a filename based on its extension.
 *
 * @param {string} filename - The filename to process
 *
 * @return {string|JSX} filename with icon
 */
function addIconToFilename(filename) {
	const extension = filename.split('.').pop().toLowerCase();

	// Check if the extension exists in the icons object
	const icon = icons[extension] || '';

	if (!icon) {
		return filename;
	}

	return (
		<>
			{icon}
			{filename}
		</>
	);
}

export default function CustomCodeSettings(props) {
	const { data, updateData, onTabChange } = props;

	const [showInfo, setShowInfo] = useState(false);
	const [showAdditional, setShowAdditional] = useState(false);
	const [withEditorStyle, setWithEditorStyle] = useState(!!data.style_editor);
	const [tab, setTab] = useState('frontend');

	const { currentTheme } = useSelect(($select) => {
		const { getCurrentTheme } = $select('core');

		return {
			currentTheme: getCurrentTheme(),
		};
	}, []);

	// On tab change callback.
	useEffect(() => {
		if (onTabChange) {
			onTabChange(tab);
		}
	}, [onTabChange, tab]);

	// Set default tab when code preview is disabled or code has a single output.
	useEffect(() => {
		if (
			tab === 'editor' &&
			(data.code_show_preview === 'never' || data.code_single_output)
		) {
			setTab('frontend');
		} else if (
			tab === 'editor-style' &&
			(data.code_show_preview === 'never' || !withEditorStyle)
		) {
			setTab('block-style');
		}
	}, [data, tab, withEditorStyle]);

	// add ajax check for filter
	//
	// has_filter( $block_slug . '/frontend_callback' )
	//
	// and print
	// sprintf( __( 'For block output used filter: %s', 'lazy-blocks' ), '<code>' . $block_slug . '/frontend_callback</code>' )
	//
	//
	// has_filter( $block_slug . '/editor_callback' )
	//
	// and print
	// sprintf( __( 'For block output used filter: %s', 'lazy-blocks' ), '<code>' . $block_slug . '/editor_callback</code>' )

	const isStyleTab = tab.includes('style');
	const isScriptTab = tab.includes('script');
	const unifiedCode =
		data.code_show_preview === 'never' || data.code_single_output;

	// Code tabs.
	const tabs = [
		{
			name: 'frontend',
			title: addIconToFilename(
				unifiedCode
					? `block.${data.code_output_method}`
					: `frontend.${data.code_output_method}`
			),
			className: 'lazyblocks-control-tabs-tab',
		},
	];

	if (!unifiedCode) {
		tabs.push({
			name: 'editor',
			title: addIconToFilename(`editor.${data.code_output_method}`),
			className: 'lazyblocks-control-tabs-tab',
		});
	}

	// Styles.
	tabs.push({
		name: 'block-style',
		title: addIconToFilename('block.css'),
		className: 'lazyblocks-control-tabs-tab',
	});
	if (withEditorStyle) {
		tabs.push({
			name: 'editor-style',
			title: addIconToFilename('editor.css'),
			className: 'lazyblocks-control-tabs-tab',
		});
	}

	// Scripts.
	tabs.push({
		name: 'view-script',
		title: addIconToFilename('view.js'),
		className: 'lazyblocks-control-tabs-tab',
	});

	const settingsFilterData = { props, tab, setTab };

	const outputMethodOpts = [
		{
			label: <span>{__('HTML + Handlebars', 'lazy-blocks')}</span>,
			value: 'html',
		},
		{
			label: __('PHP', 'lazy-blocks'),
			value: 'php',
		},
		{
			label: __('Theme Template', 'lazy-blocks'),
			value: 'template',
		},
	];

	// Output method settings.
	const settingsOutputMethod = applyFilters(
		`lzb.constructor.code-settings.output-method`,
		isStyleTab || isScriptTab ? (
			<div style={{ padding: '0 12px' }}>
				{isStyleTab
					? __('CSS', 'lazy-blocks')
					: __('JS', 'lazy-blocks')}
			</div>
		) : (
			<Select
				id="lazyblocks-boxes-code-output-method"
				placeholder={__('Select output method', 'lazy-blocks')}
				value={outputMethodOpts.find(
					(option) => option.value === data.code_output_method
				)}
				options={outputMethodOpts}
				onChange={({ value }) => {
					updateData({ code_output_method: value });
				}}
				isSearchable={false}
				styles={{
					control: (styles, state) => {
						let newStyles = Object.assign(styles, {
							cursor: 'pointer',
							minHeight: 30,
						});

						if (state.isFocused && !state.isDisabled) {
							newStyles = Object.assign(newStyles, {
								borderColor: '#007cba',
							});
						} else {
							newStyles = Object.assign(newStyles, {
								borderColor: 'transparent',
								'&:hover': {
									borderColor: '',
								},
							});
						}

						if (state.isFocused) {
							newStyles = Object.assign(newStyles, {
								boxShadow: '0 0 0 1px #007cba',
								'&:hover': {
									borderColor: '#007cba',
								},
							});
						}

						return newStyles;
					},
					menu: (styles) => {
						const newStyles = Object.assign(styles, {
							zIndex: 5,
							minWidth: 200,
						});
						return newStyles;
					},
				}}
			/>
		),
		settingsFilterData
	);

	// Additional settings.
	const settingsAdditional = (
		<Dropdown
			className="lzb-block-builder-custom-code-dropdown"
			contentClassName="lzb-block-builder-custom-code-dropdown-content"
			popoverProps={{
				placement: 'bottom-end',
				shift: true,
			}}
			open={showAdditional}
			onToggle={() => setShowAdditional(!showAdditional)}
			renderToggle={({ onToggle: toggle }) => (
				<Button onClick={() => toggle()}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<path d="M20 7h-9" fill="none" />
						<path d="M14 17H5" fill="none" />
						<circle cx="17" cy="17" r="3" fill="none" />
						<circle cx="7" cy="7" r="3" fill="none" />
					</svg>
				</Button>
			)}
			renderContent={() => {
				return applyFilters(
					`lzb.constructor.code-settings.additional`,
					<>
						{data.code_output_method !== 'template' ? (
							<>
								<BaseControl
									id="lazyblocks-settings-code-single-output"
									label={__(
										'Unified Block Code',
										'lazy-blocks'
									)}
									__nextHasNoMarginBottom
								>
									<ToggleControl
										id="lazyblocks-settings-code-single-output"
										label={__('Yes', 'lazy-blocks')}
										checked={data.code_single_output}
										onChange={(value) =>
											updateData({
												code_single_output: value,
											})
										}
										__nextHasNoMarginBottom
									/>
									<br />
								</BaseControl>
								<BaseControl
									id="lazyblocks-settings-style-single-output"
									label={__(
										'With Editor Style',
										'lazy-blocks'
									)}
									__nextHasNoMarginBottom
								>
									<ToggleControl
										id="lazyblocks-settings-style-single-output"
										label={__('Yes', 'lazy-blocks')}
										checked={withEditorStyle}
										onChange={(value) => {
											updateData({
												style_editor: '',
											});
											setWithEditorStyle(value);
										}}
										__nextHasNoMarginBottom
									/>
									<br />
								</BaseControl>
							</>
						) : null}
						<BaseControl
							id="lazyblocks-settings-output-in-editor"
							label={__('Code Output in Editor', 'lazy-blocks')}
							__nextHasNoMarginBottom
						>
							<SelectControl
								id="lazyblocks-settings-output-in-editor"
								options={[
									{
										label: __(
											'Always Visible',
											'lazy-blocks'
										),
										value: 'always',
									},
									{
										label: __(
											'Visible only when Selected',
											'lazy-blocks'
										),
										value: 'selected',
									},
									{
										label: __(
											'Visible only when Not Selected',
											'lazy-blocks'
										),
										value: 'unselected',
									},
									{
										label: __('Hidden', 'lazy-blocks'),
										value: 'never',
									},
								]}
								value={data.code_show_preview}
								onChange={(value) =>
									updateData({ code_show_preview: value })
								}
								__next40pxDefaultSize
								__nextHasNoMarginBottom
							/>
						</BaseControl>
					</>,
					settingsFilterData
				);
			}}
		/>
	);

	// Info settings.
	const settingsInfo = (
		<Dropdown
			className="lzb-block-builder-custom-code-dropdown"
			popoverProps={{
				placement: 'bottom-end',
				shift: true,
			}}
			open={showInfo}
			onToggle={() => setShowInfo(!showInfo)}
			renderToggle={({ onToggle: toggle }) => (
				<Button onClick={() => toggle()}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" fill="none" />
						<path
							d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
							fill="none"
						/>
						<path d="M12 17h.01" fill="none" />
					</svg>
				</Button>
			)}
			renderContent={() => {
				return applyFilters(
					`lzb.constructor.code-settings.info`,
					<>
						{data.code_output_method === 'template' ? (
							<Notice status="info" isDismissible={false}>
								<div style={{ minWidth: '300px' }}>
									{__(
										'Lazy Blocks will search for a template file in your theme directory. Read more:',
										'lazy-blocks'
									)}{' '}
									<a
										href={`https://www.lazyblocks.com/docs/blocks-code/theme-template/?utm_source=plugin&utm_medium=block-builder&utm_campaign=how_to_use_theme_template&utm_content=${pluginVersion}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										{__(
											'How to use theme template',
											'lazy-blocks'
										)}
									</a>
								</div>
							</Notice>
						) : (
							<Notice status="info" isDismissible={false}>
								<div style={{ minWidth: '300px' }}>
									<p className="description">
										{__(
											'Simple text field example see here:',
											'lazy-blocks'
										)}{' '}
										<a
											href={`https://www.lazyblocks.com/docs/blocks-controls/text/?utm_source=plugin&utm_medium=block-builder&utm_campaign=how_to_use_control&utm_content=${pluginVersion}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											https://www.lazyblocks.com/docs/blocks-controls/text/
										</a>
									</p>
									<hr />
									<p className="description">
										{__(
											'Note 1: if you use blocks as Metaboxes, you may leave this code editor blank.',
											'lazy-blocks'
										)}
									</p>
									<p className="description">
										{__(
											'Note 2: supported custom PHP callback to output block',
											'lazy-blocks'
										)}{' '}
										<a
											href={`https://www.lazyblocks.com/docs/blocks-code/php-callback/?utm_source=plugin&utm_medium=block-builder&utm_campaign=how_to_use_php_callback&utm_content=${pluginVersion}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											https://www.lazyblocks.com/docs/blocks-code/php-callback/
										</a>
										.
									</p>
								</div>
							</Notice>
						)}
					</>,
					settingsFilterData
				);
			}}
		/>
	);

	// Output code settings.
	const settingsOutputCode = applyFilters(
		`lzb.constructor.code-settings.output-code`,
		data.code_output_method !== 'template' ? (
			<>
				<BaseControl __nextHasNoMarginBottom>
					<div
						className={classnames(
							'lzb-block-builder-output-code-wrapper',
							isStyleTab && 'lzb-block-builder-output-code-style',
							isScriptTab &&
								'lzb-block-builder-output-code-script'
						)}
					>
						<div className="lzb-block-builder-output-code-toolbar">
							{settingsOutputMethod || null}
							{settingsAdditional || null}
							{settingsInfo || null}
						</div>
						<CodeEditor
							key={`code_${tab}` + data.code_output_method}
							mode={
								// eslint-disable-next-line no-nested-ternary
								isStyleTab
									? 'css'
									: // eslint-disable-next-line no-nested-ternary
										isScriptTab
										? 'javascript'
										: data.code_output_method === 'html'
											? 'handlebars'
											: 'php'
							}
							onChange={(value) =>
								updateData({
									// eslint-disable-next-line no-nested-ternary
									[isStyleTab
										? `style_${tab.replace('-style', '')}`
										: isScriptTab
											? `script_${tab.replace('-script', '')}`
											: `code_${tab}_html`]: value,
								})
							}
							value={
								// eslint-disable-next-line no-nested-ternary
								isStyleTab && !isPro
									? proStylesComment
									: isScriptTab && !isPro
										? proScriptComment
										: data[
												// eslint-disable-next-line no-nested-ternary
												isStyleTab
													? `style_${tab.replace('-style', '')}`
													: isScriptTab
														? `script_${tab.replace(
																'-script',
																''
															)}`
														: `code_${tab}_html`
											]
							}
							minLines={13}
							maxLines={30}
							editorProps={{
								// eslint-disable-next-line no-nested-ternary
								id: `lzb-editor-${isStyleTab ? 'css' : isScriptTab ? 'js' : data.code_output_method}`,
							}}
							readOnly={
								(isStyleTab && !isPro) ||
								(isScriptTab && !isPro)
							}
						/>
					</div>
				</BaseControl>
			</>
		) : null,
		settingsFilterData
	);

	// Information about Theme Template usage.
	const settingsOutputTemplate = applyFilters(
		`lzb.constructor.code-settings.output-template`,
		data.code_output_method === 'template' &&
			currentTheme &&
			currentTheme.stylesheet ? (
			<>
				<div className="lzb-block-builder-theme-template-wrapper">
					<div className="lzb-block-builder-theme-template-toolbar">
						{settingsOutputMethod || null}
						{settingsAdditional || null}
						{settingsInfo || null}
					</div>
					<CodeEditor
						mode="bash"
						value={`/${wpContentDir}/themes/${currentTheme.stylesheet}/
├── blocks/
│   └── lazyblock-${data.slug}/
│       ├── block.php                # Frontend & Editor template (required)
│       │                            # This file is always used for block render
│       │
│       ├── editor.php               # Editor-only template (optional)
│       │                            # Loaded only in the editor, alongside block.php
│       │
│       ├── block.css                # Frontend & Editor styles (optional)
│       │                            # Automatically enqueued if present
│       │                            # Available in Pro version only
│       │
│       ├── editor.css               # Editor-only styles (optional)
│       │                            # Automatically enqueued in editor only
│       │                            # Available in Pro version only
│       │
│       └── view.js                  # Frontend-only JavaScript (optional)
│                                    # Automatically enqueued on the frontend
│                                    # Available in Pro version only
│
│   └── lazyblock-another-block/     # You can create multiple blocks
│       ├── ...`}
						minLines={5}
						maxLines={10}
						readOnly
					/>
				</div>
			</>
		) : null,
		settingsFilterData
	);

	// Preview settings.
	const settingsPreview = applyFilters(
		`lzb.constructor.code-settings.preview`,
		null,
		settingsFilterData
	);

	let codeTabs = '';

	if (
		data.code_output_method === 'template' &&
		currentTheme &&
		currentTheme.stylesheet
	) {
		codeTabs = (
			<TabPanel
				className="lazyblocks-control-tabs"
				activeClass="is-active-invisible"
				tabs={[
					{
						name: 'both',
						title: (
							<>
								{icons.wp}
								{`${currentTheme.stylesheet}/blocks/lazyblock-${data.slug}`}
							</>
						),
						className: 'lazyblocks-control-tabs-tab',
					},
				]}
			>
				{() => null}
			</TabPanel>
		);
	} else if (data.code_output_method !== 'template') {
		codeTabs = (
			<TabPanel
				className="lazyblocks-control-tabs"
				activeClass="is-active"
				tabs={tabs}
				onSelect={(value) => setTab(value)}
			>
				{() => null}
			</TabPanel>
		);
	}

	return (
		<div className="lzb-block-builder-custom-code-settings">
			{codeTabs || null}
			{settingsOutputCode || null}
			{settingsOutputTemplate || null}

			{settingsPreview ? <Box>{settingsPreview}</Box> : null}
		</div>
	);
}
