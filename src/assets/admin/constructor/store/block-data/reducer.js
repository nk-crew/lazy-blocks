/* eslint-disable no-param-reassign */
import getUID from '../../../utils/get-uid';

const { omit, merge } = window.lodash;

function resort(data, id, newId, insertBefore = true) {
  const newControls = {};

  Object.keys(data).forEach((key) => {
    if (key !== id) {
      if (insertBefore && key === newId) {
        newControls[id] = { ...data[id] };
      }

      newControls[key] = { ...data[key] };

      if (!insertBefore && key === newId) {
        newControls[id] = { ...data[id] };
      }
    } else {
      insertBefore = false;
    }
  });

  return newControls;
}

function reducer(state = { data: false }, action = {}) {
  switch (action.type) {
    case 'SET_BLOCK_DATA':
      if (action.data) {
        if (state) {
          return {
            ...state,
            data: action.data,
          };
        }
        return action;
      }

      break;
    case 'UPDATE_BLOCK_DATA':
      if (action.data && state) {
        return {
          ...state,

          // We can't use `merge` function as arrays like `supports_align` should be replaced, not merged.
          data: {
            ...(state.data || {}),
            ...(action.data || {}),
          },
        };
      }

      break;
    case 'UPDATE_CONTROL_DATA':
      if (
        action.id &&
        action.data &&
        state.data &&
        state.data.controls &&
        state.data.controls[action.id]
      ) {
        // We can't just use merge() here, as it will merge inner arrays
        // but we always need to override it.
        return {
          ...state,
          data: {
            ...(state.data || {}),
            controls: {
              ...(state.data.controls || {}),
              [action.id]: {
                ...(state.data.controls[action.id] || {}),
                ...action.data,
              },
            },
          },
        };
      }

      break;
    case 'ADD_CONTROL':
      if (action.data && state.data) {
        const { controls = {} } = state.data;

        let newId = getUID();
        while (typeof controls[`control_${newId}`] !== 'undefined') {
          newId = getUID();
        }
        newId = `control_${newId}`;

        const newData = merge({}, state.data, {
          controls: {
            [newId]: action.data,
          },
        });

        // insert after another control
        if (action.resortId) {
          newData.controls = resort(newData.controls, newId, action.resortId, false);
        }

        return {
          ...state,
          data: newData,
          selectedControlId: newId,
        };
      }

      break;
    case 'REMOVE_CONTROL':
      if (action.id && state.data && state.data.controls && state.data.controls[action.id]) {
        return {
          ...state,
          data: {
            ...state.data,
            controls: omit(state.data.controls, [action.id]),
          },
        };
      }

      break;
    case 'RESORT_CONTROL':
      if (
        action.id &&
        action.newId &&
        action.id !== action.newId &&
        state.data &&
        state.data.controls
      ) {
        const newControls = resort(state.data.controls, action.id, action.newId);

        return {
          ...state,
          data: {
            ...state.data,
            controls: newControls,
          },
        };
      }

      break;
    case 'SELECT_CONTROL':
      if (action.id) {
        return {
          ...state,
          selectedControlId: action.id,
        };
      }

      break;
    case 'CLEAR_SELECTED_CONTROL':
      if (state.selectedControlId) {
        return {
          ...state,
          selectedControlId: null,
        };
      }

      break;
    // no default
  }

  return state;
}

export default reducer;
