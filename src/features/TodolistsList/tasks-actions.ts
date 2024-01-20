import {createAsyncThunk} from '@reduxjs/toolkit';
import {setAppStatus} from 'app/app-reducer';
import {AppRootStateType} from 'app/store';
import {todolistsAPI, UpdateTaskModelType} from 'api/todolists-api';
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils';
import {UpdateDomainTaskModelType} from 'features/TodolistsList/tasks-reducer';

export const fetchTasksTC = createAsyncThunk(`tasks/fetchTasks`, async (todolistId: string, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTasks(todolistId)
        const tasks = res.data.items
        dispatch(setAppStatus({status: 'succeeded'}))
        return {tasks, todolistId}
    } catch (e) {
        return rejectWithValue(null)
    }
})
export const removeTaskTC = createAsyncThunk(`tasks/removeTaskTC`, async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    const {dispatch, rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId)

        /* const action = removeTaskAC({taskId:param.taskId, todolistId:param.todolistId})
         dispatch(action)*/
        dispatch(setAppStatus({status: 'succeeded'}))
        return {taskId: param.taskId, todolistId: param.todolistId}
    } catch (e) {
        return rejectWithValue(null)
    }
})
export const addTaskTC = createAsyncThunk<any, { title: string, todolistId: string }>(`tasks/addTask`,
    async (param: { title: string, todolistId: string }, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res = await todolistsAPI.createTask(param.todolistId, param.title)
            if (res.data.resultCode === 0) {
                dispatch(setAppStatus({status: 'succeeded'}))
                return res.data.data.item

            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })
export const updateTaskTC = createAsyncThunk<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }>
(`tasks/updateTask`,
    async (param: { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {
        const {dispatch, rejectWithValue, getState} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const state = getState() as AppRootStateType
            const task = state.tasks[param.todolistId].find(t => t.id === param.taskId)
            if (!task) {
                //throw new Error("task not found in the state");
                console.warn('task not found in the state')
                return rejectWithValue('task not found in the state')
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...param.domainModel
            }
            const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel)
            if (res.data.resultCode === 0) {
                return {taskId: param.taskId, model: param.domainModel, todolistId: param.todolistId}
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null)
            }
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })