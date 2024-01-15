import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {setAppStatus} from 'app/app-reducer';
import {addTodolist, removeTodolist, setTodolists} from 'features/TodolistsList/todolists-reducer';
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
        addTaskAC: (state, action: PayloadAction<TaskType>) => {
            //return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
            const tasks = state[action.payload.todoListId]
            tasks.unshift(action.payload)
        },
        updateTaskAC: (state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>) => {
            const tasks = state[action.payload.todolistId]
            const index = tasks.findIndex(task => task.id === action.payload.taskId)
            if (index !== -1) tasks[index] = {...tasks[index], ...action.payload.model}

        },
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
            .addCase(addTodolist, (state, action) => {
                state[action.payload.todolist.id] = []
            })
            .addCase(removeTodolist, (state, action) => {
                delete state[action.payload.id]
            })
            .addCase(setTodolists, (state, action) => {
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
    }
})

export const fetchTasksTC = createAsyncThunk(`${slice.name}/fetchTasks`, async (todolistId: string, thunkAPI) => {
    const {dispatch,rejectWithValue} = thunkAPI
    dispatch(setAppStatus({status: 'loading'}))
   try{
       const res = await todolistsAPI.getTasks(todolistId)
       const tasks = res.data.items
       dispatch(setAppStatus({status: 'succeeded'}))
       return {tasks, todolistId}
   }catch (e) {
     return rejectWithValue(null)
   }
})
export const removeTaskTC = createAsyncThunk(`${slice.name}/removeTaskTC`, async (param: { taskId: string, todolistId: string }, thunkAPI) => {
    const {dispatch,rejectWithValue} = thunkAPI
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

// thunks
/*export const _fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(setAppStatus({status: 'succeeded'}))
        })
}*/
/*export const removeTaskTC_ = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}*/
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(setAppStatus({status: 'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC(task)
                dispatch(action)
                dispatch(setAppStatus({status: 'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
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
    }

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
export const {/*removeTaskAC,*/ addTaskAC, updateTaskAC, /*setTasksAC*//*,clearTasks*/} = slice.actions