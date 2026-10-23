/**
 * External dependencies.
 */
import slugify from 'slugify';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';

const { controls: allControls = {}, controls_categories: allCategories = {} } =
	window.lazyblocksBlockBuilderData || {};

export const CONTROL_CATEGORIES = allCategories;

// Controls added on this page load. Their name follows the label until the
// name is edited, existing controls keep their name: templates use it.
const newControlIds = new Set();

export function markNewControl(id) {
	newControlIds.add(id);
}

/**
 * Data update for a new label. A control added on this page keeps its name in
 * step with the label while the name was not edited by hand.
 *
 * @param {string} id    Control id.
 * @param {Object} data  Control data.
 * @param {string} label New label.
 *
 * @return {Object} Control data update.
 */
export function getLabelUpdate(id, data, label) {
	const result = { label };

	if (
		newControlIds.has(id) &&
		getControlTypeData(data.type).restrictions.name_settings &&
		(data.name || '') === getControlName(data.label || '')
	) {
		result.name = getControlName(label);
	}

	return result;
}

/**
 * Whether a control type can be used for the given control.
 *
 * @param {Object} controlTypeData Control type data.
 * @param {Object} data            Control data (`child_of` and `placement` are used).
 * @param {Object} blockData       Block data.
 *
 * @return {boolean} True when the type cannot be used.
 */
function isTypeDisabled(controlTypeData, data, blockData) {
	if (!controlTypeData) {
		return false;
	}

	// restrict as child.
	if (!controlTypeData.restrictions.as_child && data.child_of) {
		return true;
	}

	// restrict once per block.
	if (
		controlTypeData.restrictions.once &&
		blockData &&
		blockData.controls &&
		Object.keys(blockData.controls).some(
			(i) => controlTypeData.name === blockData.controls[i].type
		)
	) {
		return true;
	}

	// restrict if block does not contain supported placement
	if (controlTypeData.restrictions.placement_settings && data.placement) {
		const placementSettings =
			controlTypeData.restrictions.placement_settings;

		// If control is inside a repeater, check repeater's placement instead
		let currentPlacement = data.placement;
		if (data.child_of && blockData && blockData.controls) {
			const parentControl = blockData.controls[data.child_of];
			if (parentControl) {
				currentPlacement = parentControl.placement;
			}
		}

		switch (currentPlacement) {
			case 'content':
				return !placementSettings.includes('content');
			case 'inspector':
				return !placementSettings.includes('inspector');
			case 'both': {
				// Don't allow 'both' if control has fallback restrictions
				const hasFallback =
					placementSettings.includes('content-fallback') ||
					placementSettings.includes('inspector-fallback');

				return (
					hasFallback ||
					!(
						placementSettings.includes('content') ||
						placementSettings.includes('inspector')
					)
				);
			}
			// 'nowhere' placement is always allowed as it doesn't render anywhere
			// no default
		}
	}

	return false;
}

/**
 * Control types that can be picked for a control, in the order of the
 * registered controls.
 *
 * @param {Object} data      Control data (`child_of` and `placement` are used).
 * @param {Object} blockData Block data.
 *
 * @return {Array} Types: name, label, category, icon, isDisabled.
 */
export function getControlTypes(data, blockData) {
	return Object.keys(allControls)
		.map((k) => {
			const controlTypeData = getControlTypeData(allControls[k].name);

			return {
				name: allControls[k].name,
				label: allControls[k].label,
				category: allControls[k].category,
				icon: controlTypeData.icon,
				isDisabled: isTypeDisabled(controlTypeData, data, blockData),
				isHiddenFromSelect:
					!!controlTypeData?.restrictions?.hidden_from_select,
			};
		})
		.filter((type) => !type.isHiddenFromSelect);
}

export function getControlName(label) {
	return slugify(label, {
		replacement: '-',
		lower: true,
		remove: /[^\w\s$0-9-*+~.$(_)#&|'"!:;@/\\]/g,
	});
}

/**
 * Data of a new control of the given type, labelled after the type ("Image",
 * "Image 2") and named after its label.
 *
 * @param {string} type     Control type name.
 * @param {Object} controls Existing block controls.
 * @param {Object} extra    Additional data, e.g. placement and child_of.
 *
 * @return {Object} New control data.
 */
export function getNewControlData(type, controls, extra) {
	const controlTypeData = getControlTypeData(type);
	const existing = Object.values(controls || {});
	const names = existing.map((control) => control.name);

	// "Rich Text (WYSIWYG)" -> "Rich Text".
	const typeLabel = (controlTypeData.label || type)
		.replace(/\s*\(.*\)$/, '')
		.trim();

	let label = typeLabel;
	let name = getControlName(label);
	let i = existing.filter((control) => control.type === type).length;

	while (names.includes(name)) {
		i += 1;
		label = `${typeLabel} ${i}`;
		name = getControlName(label);
	}

	const result = {
		...(controlTypeData.attributes || {}),
		...extra,
		type,
	};

	if (controlTypeData.restrictions.label_settings) {
		result.label = label;
	}
	if (controlTypeData.restrictions.name_settings) {
		result.name = name;
	}

	return result;
}
