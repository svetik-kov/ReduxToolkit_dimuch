import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {setAppStatus} from 'app/app-reducer';
import {handleServerAppError, handleServerNetworkError} from 'utils/error-utils';
import {AppRootStateType} from 'app/store';
import {asyncAction as asyncTodolistAction} from './todolists-reducer'

const initialState: TasksStateType = {}

 const fetchTasks = createAsyncThunk(`tasks/fetchTasks`, async (todolistId: string, thunkAPI) => {
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
 const removeTask = createAsyncThunk(`tasks/removeTaskTC`, async (param: { taskId: string, todolistId: string }, thunkAPI) => {
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
 const addTask = createAsyncThunk<any, { title: string, todolistId: string }>(`tasks/addTask`,
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
 const updateTask = createAsyncThunk<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }, { taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string }>
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

export const  asyncAction={
    fetchTasks,
    removeTask,
    addTask,
    updateTask
}
const slice = createSlice({
    name: 'tasks',
    initialState: initialState,
    reducers: {
         /*clearTasks: () => {
            return {}
        }*/
    },
    extraReducers: (builder) => {
        builder
            .addCase(asyncTodolistAction.addTodolistTC.fulfilled, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(asyncTodolistAction.removeTodolistTC.fulfilled, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(asyncTodolistAction.fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state[tl.id] = []
                })
            })
            //1 variant
            .addCase(clearTasksAndTodolists, () => {
                return {}
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todolistId] = action.payload.tasks
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks.splice(index, 1)
            })
            .addCase(addTask.fulfilled,(state, action)=>{
                const tasks = state[action.payload.todoListId]
                tasks.unshift(action.payload)
            })
            .addCase(updateTask.fulfilled,(state, action)=>{
                const tasks = state[action.payload.todolistId]
                const index = tasks.findIndex(task => task.id === action.payload.taskId)
                if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}
            })
    }
})

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

