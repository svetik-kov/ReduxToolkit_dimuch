import {createAsyncThunk} from '@reduxjs/toolkit';
import {setAppStatus} from 'app/app-reducer';
import {todolistsAPI, TodolistType} from 'api/todolists-api';
import {handleServerNetworkError} from 'utils/error-utils';
import {changeTodolistEntityStatus} from 'features/TodolistsList/todolists-reducer';

export const fetchTodolistsTC = createAsyncThunk<{ todolists: Array<TodolistType> }>(`todolists/fetchTodolists`,
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
export const removeTodolistTC = createAsyncThunk<{ id: string }, { todolistId: string }>(`todolists/removeTodolist`,
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
export const addTodolistTC = createAsyncThunk<{ todolist: TodolistType }, { title: string }>(`todolists/addTodolist`,
    async (param: { title: string }, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTodolist(param.title)
            dispatch(setAppStatus({status: 'succeeded'}))
            return {todolist: res.data.data.item}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
export const changeTodolistTitleTC = createAsyncThunk<{ id: string, title: string }, { id: string, title: string }>(`todolists/changeTodolistTitle`,
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