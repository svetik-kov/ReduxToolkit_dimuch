import {Dispatch} from 'redux'

import {authAPI, FieldErrorsType, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {setAppStatus} from 'app/app-reducer';

import {clearTasksAndTodolists} from 'common/actions/common.actions';

const initialState = {
    isLoggedIn: false
}

//https://immerjs.github.io/immer/update-patterns/
export const slice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        setIsLoggedIn(state, action: PayloadAction<{ isLoggedIn: boolean }>) {
            state.isLoggedIn = action.payload.isLoggedIn
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginTC.fulfilled, (state, action) => {
                state.isLoggedIn = true
            })
            .addCase(logoutTC.fulfilled, (state, action) => {
                state.isLoggedIn = false
            })
    }
})

 const loginTC = createAsyncThunk<{ isLoggedIn: boolean }, LoginParamsType, { rejectValue: { errors: Array<string>, fieldsErrors?: FieldErrorsType[] } }>(`${slice.name}/login`, async (param: LoginParamsType, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.login(param)
        if (res.data.resultCode === 0) {
            dispatch(setAppStatus({status: 'succeeded'}))
            return {isLoggedIn: true}
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors})
        }
    } catch (e: any) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue({errors: [e.message], fieldsErrors: undefined})
    }
})


const logoutTC = createAsyncThunk<undefined, undefined>(`${slice.name}/logout`, async (param, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            dispatch(setAppStatus({status: 'succeeded'}))
            return
        } else {
            handleServerAppError(res.data, dispatch)
            return rejectWithValue(null)
        }
    } catch (e: any) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue({errors: [e.message], fieldsErrors: undefined})
    }
})


export const asyncAction={
    loginTC,
    logoutTC
}


export const authReducer = slice.reducer
export const {setIsLoggedIn} = slice.actions