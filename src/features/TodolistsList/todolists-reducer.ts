import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatus,} from 'app/app-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';

import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils';

//https://immerjs.github.io/immer/update-patterns/
const initialState: Array<TodolistDomainType> = []

export const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) => {
            //return state.map(tl => tl.id === action.id ? {...tl, filter: action.filter} : tl)
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string, status: RequestStatusType }>) => {
            //return state.map(tl => tl.id === action.id ? {...tl, entityStatus: action.status} : tl)
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].entityStatus = action.payload.status
        },
        /* setTodolists: (state, action: PayloadAction<{ todolists: Array<TodolistType> }>) => {
             // return action.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
             // 1 variant
             action.payload.todolists.forEach((tl) => {
                 state.push({...tl, filter: 'all', entityStatus: 'idle'})
             })
             // 2 variant
             //return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
         },*/
        /*clearTodolists: () => {
            return []
        }*/
    },
    extraReducers: (builder) => {
        builder
            //2 variant
            .addCase(clearTasksAndTodolists, () => {
                return []
            })
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl: any) => {
                    state.push({...tl, filter: 'all', entityStatus: 'idle'})
                })
            })
            .addCase(removeTodolistTC.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(addTodolistTC.fulfilled, (state, action) => {
                const newTodolist: TodolistDomainType = {
                    ...action.payload.todolist,
                    filter: 'all',
                    entityStatus: 'idle'
                }
                state.unshift(newTodolist)
            })
            .addCase(changeTodolistTitleTC.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state[index].title = action.payload.title
            })
    }
})
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch
const fetchTodolists = createAsyncThunk<{ todolists: Array<TodolistType> }>(`todolists/fetchTodolists`,
    async (param, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res = await todolistsAPI.getTodolists()
            dispatch(setAppStatus({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
const removeTodolistTC = createAsyncThunk<{ id: string }, { todolistId: string }>(`todolists/removeTodolist`,
    async (param: { todolistId: string }, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        dispatch(changeTodolistEntityStatus({id: param.todolistId, status: 'loading'}))
        try {
            const res = await todolistsAPI.deleteTodolist(param.todolistId)
            dispatch(setAppStatus({status: 'succeeded'}))
            return {id: param.todolistId}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
const addTodolistTC = createAsyncThunk<{ todolist: TodolistType }, { title: string }>(`todolists/addTodolist`,
    async (param: { title: string }, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTodolist(param.title)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatus({status: 'succeeded'}))
                return {todolist: res.data.data.item}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
const changeTodolistTitleTC = createAsyncThunk<{ id: string, title: string }, { id: string, title: string }>(`todolists/changeTodolistTitle`,
    async (param: { id: string, title: string }, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res = await todolistsAPI.updateTodolist(param.id, param.title)
            dispatch(setAppStatus({status: 'succeeded'}))
            return {id: param.id, title: param.title}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
export const asyncAction = {
    fetchTodolists,
    removeTodolistTC,
    addTodolistTC,
    changeTodolistTitleTC
}

export const todolistsReducer = slice.reducer
export const {
    changeTodolistFilter,
    changeTodolistEntityStatus,
} = slice.actions