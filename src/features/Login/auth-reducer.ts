import {Dispatch} from 'redux'

import {authAPI, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setAppStatus} from 'app/app-reducer';
import {clearTasks} from 'features/TodolistsList/tasks-reducer';
import {clearTodolists} from 'features/TodolistsList/todolists-reducer';

const initialState = {
    isLoggedIn: false
}

//https://immerjs.github.io/immer/update-patterns/
const slice=createSlice({
    name:'auth',
    initialState:initialState,
    reducers:{
        setIsLoggedIn(state,action:PayloadAction<{ isLoggedIn: boolean }>){
            state.isLoggedIn=action.payload.isLoggedIn
        },

    },

})




// thunks
export const loginTC = (data: LoginParamsType) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status:'loading'}))
    authAPI.login(data)
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedIn({isLoggedIn:true}))
                dispatch(setAppStatus({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const logoutTC = () => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status:'loading'}))
    authAPI.logout()
        .then(res => {
            if (res.data.resultCode === 0) {
                dispatch(setIsLoggedIn({isLoggedIn:false}))
                dispatch(clearTasks())
                dispatch(clearTodolists())
                dispatch(setAppStatus({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch)
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}


export const authReducer = slice.reducer
export const {setIsLoggedIn}=slice.actions