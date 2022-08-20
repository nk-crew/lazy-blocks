import getControlTypeData from '../../../utils/get-control-type-data';

const { cloneDeep } = window.lodash;

export function getBlockData(state) {
  return state.data || {};
}

export function getSelectedControlId(state) {
  return state.selectedControlId || false;
}

export function getSelectedControl(state) {
  if (state.selectedControlId) {
    const blockData = state.data;

    if (blockData.controls && blockData.controls[state.selectedControlId]) {
      const controlData = getControlTypeData(blockData.controls[state.selectedControlId].type);
      return {
        ...cloneDeep(controlData),
        ...(controlData.attributes ? cloneDeep(controlData.attributes) : {}),
        ...blockData.controls[state.selectedControlId],
      };
    }
  }
  return false;
}
