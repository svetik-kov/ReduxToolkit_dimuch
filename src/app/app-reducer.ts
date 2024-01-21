import {Dispatch} from 'redux'
import {authAPI} from 'api/todolists-api'
import {setIsLoggedIn} from 'features/Auth/auth-reducer';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {InitialStateType} from 'app/app-reducer.test';
import {handleServerNetworkError} from 'utils/error-utils';

////https://immerjs.github.io/immer/update-patterns/
export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'
/*const initialState: InitialStateType = {
    status: 'idle' as RequestStatusType,
    error: null as null|string,
    isInitialized: false
}*/



const slice = createSlice({
    name: 'app',
    initialState: {
        status: 'idle' as RequestStatusType,
        error: null as null | string,
        isInitialized: false
    } as InitialStateType,
    reducers: {
        setAppError: (state, action: PayloadAction<{ error: string | null }>) => {
            state.error = action.payload.error
        },
        setAppStatus: (state, action: PayloadAction<{ status: RequestStatusType }>) => {
            state.status = action.payload.status
        },
    },
    extraReducers:(builder)=>{
        builder
            .addCase(initializeAppTC.fulfilled,(state,action)=>{
                state.isInitialized = true
            })
    }
})




 const initializeAppTC = createAsyncThunk<{isInitialized: true}, undefined>(`${slice.name}/initializeApp`, async (param, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.me()
        if (res.data.resultCode === 0) {
            dispatch(setIsLoggedIn({isLoggedIn: true}));
        } else {

        }
        return {isInitialized: true}
    } catch (e: any) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue({errors: [e.message], fieldsErrors: undefined})
    }
})


export const asyncAction={
    initializeAppTC
}

export const appReducer = slice.reducer
export const {setAppError, setAppStatus} = slice.actions
