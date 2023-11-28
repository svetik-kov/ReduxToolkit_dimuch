import {Dispatch} from 'redux'
import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AppThunk} from '../../../src/app/store';
import {appActions} from '../../../src/app/app-reducer';


const initialState: InitialStateType = {
    isLoggedIn: false
}

const slice=createSlice({
    name:'auth',
    initialState:initialState,
    reducers:{
        setIsLoggedIn:(state,action:PayloadAction<{value: boolean}>)=>{
            state.isLoggedIn=action.payload.value
        },

    }
})

export const authReducer=slice.reducer
export const authActions=slice.actions


/*export const authReducer = (state: InitialStateType = initialState, action: ActionsType): InitialStateType => {
    switch (action.type) {
        case 'login/SET-IS-LOGGED-IN':
            return {...state, isLoggedIn: action.value}
        default:
            return state
    }
}*/

// actions

// export const setIsLoggedInAC = (value: boolean) =>
//     ({type: 'login/SET-IS-LOGGED-IN', value} as const)
//

// thunks
export const loginTC = (data: LoginParamsType):AppThunk=> (dispatch) => {
    dispatch(appActions.setAppStatus({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({value:true}))
                dispatch(appActions.setAppStatus({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = ():AppThunk => (dispatch) => {
    dispatch(appActions.setAppStatus({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(authActions.setIsLoggedIn({value:false}))
                dispatch(appActions.setAppStatus({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}

// types

//type ActionsType = ReturnType<typeof setIsLoggedInAC>
type InitialStateType = {
    isLoggedIn: boolean
}

//type ThunkDispatch = Dispatch<ActionsType | SetAppStatusActionType | SetAppErrorActionType>
