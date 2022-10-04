
const initialState = {
    rebag: 0
}

const rbagReducer =  (state = initialState, action) => {
    switch (action.type){
        case 'SET_ITEM':
            return {
                ...state,
                rebag: action.data
        };
        default:
            return state
}
}

export default rbagReducer