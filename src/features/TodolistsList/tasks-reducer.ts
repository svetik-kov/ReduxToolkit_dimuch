
import {TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {AppRootStateType} from '../../app/store'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {appActions} from '../../../src/app/app-reducer';
import {addTodolistAC, removeTodolistAC, setTodolistsAC} from '../../../src/features/TodolistsList/todolists-reducer';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

const initialState: TasksStateType = {}

const slice=createSlice({
    name:'tasks',
    initialState:initialState,
    reducers:{
        removeTaskAC(state, action: PayloadAction<{ taskId: string, todolistId: string }>){
            const task=state[action.payload.todolistId]
            const index=task.findIndex(t=>t.id===action.payload.taskId)
            if (index!==-1){
                task.splice(index,1)
            }
        },
        addTaskAC(state, action: PayloadAction<{ task: TaskType }>){
            const task=state[action.payload.task.todoListId]
            task.unshift(action.payload.task)

        },
        updateTaskAC(state, action: PayloadAction<{ taskId: string, model: UpdateDomainTaskModelType, todolistId: string }>){
            const task=state[action.payload.todolistId]
            const index=task.findIndex(t=>t.id===action.payload.taskId)
            if (index!==-1){
                task[index]={...task[index],...action.payload.model}
            }
        },
        setTasksAC(state, action: PayloadAction<{ tasks: Array<TaskType>, todolistId: string }>){
            state[action.payload.todolistId]=action.payload.tasks
        }
    },
    extraReducers:(builder)=>{
        builder.addCase(addTodolistAC,(state,action)=>{
            state[action.payload.todolist.id]=[]
        })
            .addCase(removeTodolistAC,(state,action)=>{
                delete state[action.payload.id]
            })
            .addCase(setTodolistsAC,(state,action)=>{
                action.payload.todolists.forEach((tl:any)=> {
                    state[tl.id] = []
                })
            })
    }
})
export const tasksReducer = slice.reducer
export const {removeTaskAC,addTaskAC,updateTaskAC,setTasksAC}=slice.actions

/*export const tasksReducer = (state: TasksStateType = initialState, action: any): TasksStateType => {
    switch (action.type) {
        case 'REMOVE-TASK':
            return {...state, [action.todolistId]: state[action.todolistId].filter(t => t.id != action.taskId)}
        case 'ADD-TASK':
            return {...state, [action.task.todoListId]: [action.task, ...state[action.task.todoListId]]}
        case 'UPDATE-TASK':
            return {
                ...state,
                [action.todolistId]: state[action.todolistId]
                    .map(t => t.id === action.taskId ? {...t, ...action.model} : t)
            }
        case addTodolistAC.type:
            return {...state, [action.payload.todolist.id]: []}
        case removeTodolistAC.type:
            const copyState = {...state}
            delete copyState[action.payload.id]
            return copyState
        case setTodolistsAC.type: {
            const copyState = {...state}
            action.payload.todolists.forEach((tl:any)=> {
                copyState[tl.id] = []
            })
            return copyState
        }
        case 'SET-TASKS':
            return {...state, [action.todolistId]: action.tasks}
        default:
            return state
    }
}*/

// actions
/*export const removeTaskAC = (taskId: string, todolistId: string) =>
    ({type: 'REMOVE-TASK', taskId, todolistId} as const)
export const addTaskAC = (task: TaskType) =>
    ({type: 'ADD-TASK', task} as const)
export const updateTaskAC = (taskId: string, model: UpdateDomainTaskModelType, todolistId: string) =>
    ({type: 'UPDATE-TASK', model, todolistId, taskId} as const)
export const setTasksAC = (tasks: Array<TaskType>, todolistId: string) =>
    ({type: 'SET-TASKS', tasks, todolistId} as const)*/

// thunks
export const fetchTasksTC = (todolistId: string) => (dispatch: Dispatch) => {
    dispatch(appActions.setAppStatus({status:'loading'}))
    todolistsAPI.getTasks(todolistId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC({tasks, todolistId}))
            dispatch(appActions.setAppStatus({status:'succeeded'}))
        })
}
export const removeTaskTC = (taskId: string, todolistId: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todolistId, taskId)
        .then(res => {
            const action = removeTaskAC({taskId, todolistId})
            dispatch(action)
        })
}
export const addTaskTC = (title: string, todolistId: string) => (dispatch: Dispatch) => {
    dispatch(appActions.setAppStatus({status:'loading'}))
    todolistsAPI.createTask(todolistId, title)
        .then(res => {
            if (res.data.resultCode === 0) {
                const task = res.data.data.item
                const action = addTaskAC({task})
                dispatch(action)
                dispatch(appActions.setAppStatus({status:'succeeded'}))
            } else {
                handleServerAppError(res.data, dispatch);
            }
        })
        .catch((error) => {
            handleServerNetworkError(error, dispatch)
        })
}
export const updateTaskTC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) =>
    (dispatch: ThunkDispatch, getState: () => AppRootStateType) => {
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
                    const action = updateTaskAC({taskId, model:domainModel, todolistId})
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
/*type ActionsType =
    | ReturnType<typeof removeTaskAC>
    | ReturnType<typeof addTaskAC>
    | ReturnType<typeof updateTaskAC>
    | ReturnType<typeof setTasksAC>*/
type ThunkDispatch = Dispatch
