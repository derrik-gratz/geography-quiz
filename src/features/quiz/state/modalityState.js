/**
 * @typedef {Object} ModalityState
 * @property {string} modalityType - 'name' | 'flag' | 'location'
 * @property {string|null} selectedValue
 * @property {string|null} correctValue
 * @property {boolean} disabled
 * @property {boolean} collapsed
 * @property {string} componentStatus - 'prompting' | 'reviewing' | 'active' | 'completed' | 'failed' | 'disabled' | 'sandbox' | 'unknown'
 * @property {*[]} incorrectValues
 */

export function createInitialModalityState(modalityType) {
    return {
        modalityType: modalityType,
        selectedValue: null,
        correctValue: null,
        disabled: true,
        collapsed: false,
        componentStatus: 'disabled',
        incorrectValues: [],
    };
}

export function modalityReducer(state, action) {
    switch (action.type) {
        case 'SELECTED_VALUE_CHANGED':
            return {
                ...state,
                selectedValue: action.payload
            }
        case 'UNSELECT_VALUE':
            return {
                ...state,
                selectedValue: null
            }
        case 'STATUS_CHANGED':
            const disabled = action.payload !== 'incomplete' && action.payload !== 'sandbox';
            return {
                ...state,
                componentStatus: action.payload,
                disabled: disabled
            }
        case 'INCORRECT_VALUES_CHANGED':
            return {
                ...state,
                incorrectValues: action.payload
            }
        case 'CORRECT_VALUE_CHANGED':
            return {
                ...state,
                correctValue: action.payload
            }
        case 'DISABLE_COMPONENT':
            return {
                ...state,
                disabled: true
            }
        case 'ENABLE_COMPONENT':
            return {
                ...state,
                disabled: false
            }
        case 'COLLAPSE_COMPONENT':
            return {
                ...state,
                collapsed: true
            }
        case 'EXPAND_COMPONENT':
            return {
                ...state,
                collapsed: false
            }
        default:
            return state;
    }
}