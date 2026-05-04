/**
 * WordPress dependencies.
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { cloneDeep } from 'lodash';

/**
 * Internal dependencies.
 */
import getControlTypeData from '../../../utils/get-control-type-data';

const EMPTY_OBJECT = {};

export function getBlockData(state) {
	return state.data || EMPTY_OBJECT;
}

export function getSelectedControlId(state) {
	return state.selectedControlId || false;
}

let lastSelectedControlId = null;
let lastSelectedControlData = null;
let lastSelectedControlResult = false;

export function getSelectedControl(state) {
	if (state.selectedControlId) {
		const blockData = state.data;

		if (blockData.controls && blockData.controls[state.selectedControlId]) {
			const currentControlData =
				blockData.controls[state.selectedControlId];

			// Return cached result if inputs haven't changed.
			if (
				state.selectedControlId === lastSelectedControlId &&
				currentControlData === lastSelectedControlData
			) {
				return lastSelectedControlResult;
			}

			const controlData = getControlTypeData(currentControlData.type);
			const result = {
				...cloneDeep(controlData),
				...(controlData.attributes
					? cloneDeep(controlData.attributes)
					: {}),
				...currentControlData,
			};

			lastSelectedControlId = state.selectedControlId;
			lastSelectedControlData = currentControlData;
			lastSelectedControlResult = result;

			return result;
		}
	}
	return false;
}
