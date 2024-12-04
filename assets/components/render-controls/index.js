/**
 * WordPress dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';
import { Component, Fragment, RawHTML } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { PanelBody, ExternalLink, Notice } from '@wordpress/components';
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../utils/get-control-type-data';
import getControlValue from '../../utils/get-control-value';
import checkControlValidity from '../../utils/check-control-validity';

let options = window.lazyblocksGutenberg;
if (!options || !options.blocks || !options.blocks.length) {
	options = {
		post_type: 'post',
		blocks: [],
		controls: {},
	};
}

/**
 * We created the class Component because the functional one is not working correctly for some reason.
 * {@link https://shot.nkdev.info/AkJ2naU7MazVtAnv5F2A}
 *
 * @param {Object} props component data.
 *
 * @return {JSX} - render component.
 */
export default class RenderControls extends Component {
	constructor(...args) {
		super(...args);

		this.onControlChange = this.onControlChange.bind(this);
		this.getControls = this.getControls.bind(this);
		this.renderControl = this.renderControl.bind(this);
		this.renderControls = this.renderControls.bind(this);
	}

	onControlChange(val, control, childIndex) {
		const { lazyBlockData, attributes, setAttributes, meta, setMeta } =
			this.props;
		let { name } = control;

		// prepare child items.
		if (
			control.child_of &&
			lazyBlockData.controls[control.child_of] &&
			childIndex > -1
		) {
			const childs = getControlValue(
				attributes,
				meta,
				lazyBlockData,
				lazyBlockData.controls[control.child_of]
			);

			if (childs && typeof childs[childIndex] !== 'undefined') {
				childs[childIndex][control.name] = val;
				val = childs;
			}

			control = lazyBlockData.controls[control.child_of];
			name = control.name;
		}

		// filter control value.
		val = applyFilters(
			`lzb.editor.control.${control.type}.updateValue`,
			val,
			control,
			childIndex
		);
		val = applyFilters(
			'lzb.editor.control.updateValue',
			val,
			control,
			childIndex
		);

		// Save post Meta.
		if (control.save_in_meta === 'true') {
			setMeta({ ...meta, [control.save_in_meta_name || name]: val });

			// Save block attribute.
		} else {
			setAttributes({ [name]: val });
		}
	}

	/**
	 * Get controls
	 *
	 * @param {string|boolean} childOf - parent control name.
	 *
	 * @return {Object} controls list.
	 */
	getControls(childOf = '') {
		const { lazyBlockData } = this.props;
		const result = {};

		Object.keys(lazyBlockData.controls).forEach((k) => {
			let control = lazyBlockData.controls[k];
			const controlTypeData = getControlTypeData(control.type);

			if (controlTypeData && controlTypeData.attributes) {
				control = {
					...cloneDeep(controlTypeData.attributes),
					...control,
				};
			}

			if (
				(!childOf && !control.child_of) ||
				(childOf && control.child_of === childOf)
			) {
				result[k] = control;
			}
		});

		return result;
	}

	/**
	 * Render controls
	 *
	 * @param {string}         placement  - controls placement [inspector, content]
	 * @param {string}         group      - control group [default, styles, advanced]
	 * @param {string|boolean} childOf    - parent control name.
	 * @param {number|boolean} childIndex - child index in parent.
	 *
	 * @return {Array} react blocks with controls.
	 */
	renderControls(
		placement,
		group = 'default',
		childOf = '',
		childIndex = false
	) {
		let result = [];
		const controls = this.getControls(childOf);

		// prepare attributes.
		Object.keys(controls).forEach((k) => {
			const control = controls[k];

			const renderedControl = this.renderControl(
				control,
				placement,
				k,
				childIndex,
				group
			);

			if (renderedControl) {
				result.push(renderedControl);
			}
		});

		// additional element for better formatting in inspector.
		if (placement === 'inspector' && result.length) {
			result = <PanelBody>{result}</PanelBody>;
		}

		// filter render result.
		result = applyFilters('lzb.editor.controls.render', result, {
			placement,
			group,
			childOf,
			childIndex,
			getControls: this.getControls,
			renderControl: this.renderControl,
		});

		return result;
	}

	/**
	 * Render single control.
	 *
	 * @param {Object}         controlData - control data
	 * @param {string}         placement   - placement
	 * @param {string}         uniqueId    - unique control ID
	 * @param {number|boolean} childIndex  - child index in parent.
	 * @param {string}         group       - group control
	 *
	 * @return {object|boolean} react control.
	 */
	renderControl(
		controlData,
		placement,
		uniqueId,
		childIndex = false,
		group = 'default'
	) {
		const {
			lazyBlockData,
			isLazyBlockSelected,
			allowErrorNotice,
			attributes,
			meta,
		} = this.props;
		let result = false;

		let placementCheck =
			controlData.type &&
			controlData.placement !== 'nowhere' &&
			(controlData.placement === 'both' ||
				controlData.placement === placement);

		let { label } = controlData;
		const controlTypeData = getControlTypeData(controlData.type);

		// Group check.
		if (placement !== 'content') {
			placementCheck = placementCheck && controlData.group === group;
		}

		// restrictions.
		if (controlTypeData && controlTypeData.restrictions) {
			// Restrict placement.
			if (
				placementCheck &&
				controlTypeData.restrictions.placement_settings
			) {
				placementCheck =
					controlTypeData.restrictions.placement_settings.indexOf(
						placement
					) > -1 ||
					controlTypeData.restrictions.placement_settings.indexOf(
						`${placement}-fallback`
					) > -1;
			}

			// Restrict hide if not selected.
			if (
				placementCheck &&
				placement === 'content' &&
				(controlData.placement === 'content' ||
					controlData.placement === 'both') &&
				controlTypeData.restrictions.hide_if_not_selected_settings &&
				controlData.hide_if_not_selected &&
				controlData.hide_if_not_selected === 'true'
			) {
				placementCheck = isLazyBlockSelected;
			}

			// Restrict required mark
			if (
				controlTypeData.restrictions.required_settings &&
				controlData.required &&
				controlData.required === 'true'
			) {
				label = `${label || ''} <span class="required">*</span>`;
			}
		}

		// prepare control output
		if (controlData.child_of || placementCheck) {
			// prepare data for filter.
			const controlRenderData = {
				data: {
					...controlData,
					help: controlData.help ? (
						<RawHTML>{controlData.help}</RawHTML>
					) : (
						false
					),
					// eslint-disable-next-line react/no-danger
					label: label ? (
						<span dangerouslySetInnerHTML={{ __html: label }} />
					) : (
						false
					),
				},
				placement,
				childIndex,
				uniqueId,
				getValue: (
					optionalControl = controlData,
					optionalChildIndex = childIndex
				) =>
					getControlValue(
						attributes,
						meta,
						lazyBlockData,
						optionalControl,
						optionalChildIndex
					),
				onChange: (val) => {
					this.onControlChange(val, controlData, childIndex);
				},
				getControls: this.getControls,
				renderControls: this.renderControls,
			};

			// get control data from filter.
			let controlResult = applyFilters(
				`lzb.editor.control.${controlData.type}.render`,
				'',
				controlRenderData,
				this.props
			);
			if (controlResult) {
				controlResult = applyFilters(
					'lzb.editor.control.render',
					controlResult,
					controlRenderData,
					this.props
				);
			}

			if (controlResult) {
				const val = controlRenderData.getValue();
				const controlNotice = [];

				// Display an error for meta controls when the post type doesn't support custom fields and the control is configured to save_in_meta fields.
				if (controlData.save_in_meta === 'true') {
					const postType = select('core/editor').getCurrentPostType();
					const postTypeObject = select('core').getPostType(postType);

					const postTypeSupportMeta =
						postTypeObject?.supports?.['custom-fields'] || false;
					if (!postTypeSupportMeta) {
						controlNotice.push(
							<Notice
								key={`notice-meta-${controlData.name}`}
								status="warning"
								isDismissible={false}
								className="lzb-block-builder-notice"
							>
								{__(
									'Custom fields are not enabled for this post type. Enable "custom-fields" support to use this control.',
									'lazy-blocks'
								)}{' '}
								<ExternalLink href="https://developer.wordpress.org/reference/functions/add_post_type_support/">
									{__('Learn how', 'lazy-blocks')}
								</ExternalLink>
							</Notice>
						);
					}
				}

				// show error for required fields
				const requiredError = checkControlValidity(val, controlData);
				if (allowErrorNotice && requiredError) {
					controlNotice.push(
						<Notice
							key={`notice-required-${controlData.name}`}
							status="error"
							isDismissible={false}
							className="lzb-block-builder-notice"
						>
							{requiredError}
						</Notice>
					);
				}

				if (placement === 'inspector') {
					result = (
						<Fragment key={`control-${uniqueId}`}>
							{controlResult}
							{controlNotice}
						</Fragment>
					);
				} else {
					result = (
						<div
							key={`control-${uniqueId}`}
							style={{
								width: controlData.width
									? `${controlData.width}%`
									: '',
							}}
						>
							{controlResult}
							{controlNotice}
						</div>
					);
				}
			}
		}

		return result;
	}

	render() {
		return this.renderControls(this.props.placement, this.props.group);
	}
}
