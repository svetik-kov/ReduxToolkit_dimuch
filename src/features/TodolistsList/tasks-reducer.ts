import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {setAppStatus} from 'app/app-reducer';
import {addTodolistTC, fetchTodolistsTC, removeTodolistTC} from 'features/TodolistsList/todolists-reducer';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';

const initialState: TasksStateType = {}

const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
        /*removeTaskAC: (state, action: PayloadAction<{ taskId: string, todolistId: string }>) => {
            //return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            if (index !== -1) tasks.splice(index, 1)
        },*/
        /*addTaskAC: (state, action: PayloadAction<TaskType>) => {
            //return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
            const tasks = state[action.payload.todoListId]
            tasks.unshift(action.payload)
        },*/
        /*updateTaskAC: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}

        },*/
        /*setTasksAC: (state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>) => {
            //return {...state, [action.todolistId]: action.tasks}
            state[action.payload.todolistId] = action.payload.tasks
        },*/
        /*clearTasks: () => {
            return {}
        }*/
    },
    extraReducers: (builder) => {
        builder
            .addCase(addTodolistTC.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(removeTodolistTC.fulfilled, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })
            })
            //1 variant
            .addCase(clearTasksAndTodolists, () => {
                return {}
            })
            .addCase(fetchTasksTC.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(removeTaskTC.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)
            })
            .addCase(addTaskTC.fulfilled,(state,action)=>{
                const tasks = state[action.payload.todoListId]
                tasks.unshift(action.payload)
            })
            .addCase(updateTaskTC.fulfilled,(state,action)=>{
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}
            })
    }
})

export const fetchTasksTC = createAsyncThunk(`${slice.name}/fetchTasks`, async (todolistId: string, thunkAPI) => {
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
export const removeTaskTC = createAsyncThunk(`${slice.name}/removeTaskTC`, async (param: { taskId: string, todolistId: string }, thunkAPI) => {
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

export const addTaskTC = createAsyncThunk<any, { title: string, todolistId: string }>(`${slice.name}/addTask`,
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


export const updateTaskTC = createAsyncThunk<{taskId:string, model: UpdateDomainTaskModelType, todolistId:string},{ taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }>
(`${slice.name}/updateTask`,
    async (param: { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }, thunkAPI) => {
    const {dispatch, rejectWithValue,getState} = thunkAPI
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
            return {taskId:param.taskId, model: param.domainModel, todolistId:param.todolistId}
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null)
        }
    } catch (e: any) {
        handleServerNetworkError(e, dispatch)
        return rejectWithValue(null)
    }
})
/*export const updateTaskTC_ = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: Dispatch, getState: () => AppRootStateType) => {
        const state = getState()
        const task = state.tasks[todolistId].find(t => t.id === taskId)
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn('task not found in the state')
            return
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...domainModel
        }

        todolistsAPI.updateTask(todolistId, taskId, apiModel)
            .then(res => {
                if (res.data.resultCode === 0) {
                    const action = updateTaskAC({taskId, model: domainModel, todolistId})
                    dispatch(action)
                } else {
                    handleServerAppError(res.data, dispatch);
                }
            })
            .catch((error) => {
                handleServerNetworkError(error, dispatch);
            })
    }*/

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}
export type TasksStateType = {
    [key: string]: Array<TaskType>
}

export const tasksReducer = slice.reducer
/*
export const {} = slice.actions*/
