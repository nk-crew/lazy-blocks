/* eslint-disable no-param-reassign */
export function apiFetch(request) {
  return {
    type: 'API_FETCH',
    request,
  };
}

export function setBlockData(data) {
  // check if control is array and change it to object
  // unless value will not be saved.
  // related topic: https://wordpress.org/support/topic/controls-not-saving/
  if (data.controls && typeof data.controls === 'object' && data.controls.constructor === Array) {
    data.controls = {};
  }

  return {
    type: 'SET_BLOCK_DATA',
    data,
  };
}

export function updateBlockData(data) {
  return {
    type: 'UPDATE_BLOCK_DATA',
    data,
  };
}

export function updateControlData(id, data) {
  return {
    type: 'UPDATE_CONTROL_DATA',
    id,
    data,
  };
}

export function addControl(data, resortId) {
  return {
    type: 'ADD_CONTROL',
    data,
    resortId,
  };
}

export function removeControl(id) {
  return {
    type: 'REMOVE_CONTROL',
    id,
  };
}

export function resortControl(id, newId) {
  return {
    type: 'RESORT_CONTROL',
    id,
    newId,
  };
}

export function selectControl(id) {
  return {
    type: 'SELECT_CONTROL',
    id,
  };
}

export function clearSelectedControl() {
  return {
    type: 'CLEAR_SELECTED_CONTROL',
  };
}
