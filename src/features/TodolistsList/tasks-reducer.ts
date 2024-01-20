import {TaskPriorities, TaskStatuses, TaskType} from '../../api/todolists-api'
import {createSlice} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {addTaskTC, fetchTasksTC, removeTaskTC, updateTaskTC} from 'features/TodolistsList/tasks-actions';
import {addTodolistTC, fetchTodolistsTC, removeTodolistTC} from 'features/TodolistsList/todolists-actions';

const initialState: TasksStateType = {}

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

