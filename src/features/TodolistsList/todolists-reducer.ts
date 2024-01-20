import {TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType,} from 'app/app-reducer'
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';
import {
    addTodolistTC,
    changeTodolistTitleTC,
    fetchTodolistsTC,
    removeTodolistTC
} from 'features/TodolistsList/todolists-actions';

//https://immerjs.github.io/immer/update-patterns/
const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
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
            .addCase(fetchTodolistsTC.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl: any) => {
                    state.push({...tl, filter: 'all', entityStatus: 'idle'})
                })
            })
            .addCase(removeTodolistTC.fulfilled, (state, action) => {
                const index = state.findIndex(todo => todo.id === action.payload.id)
                if (index !== -1) state.splice(index, 1)
            })
            .addCase(addTodolistTC.fulfilled,(state,action)=>{
                const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'}
                state.unshift(newTodolist)
            })
            .addCase(changeTodolistTitleTC.fulfilled,(state,action)=>{
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


export const todolistsReducer = slice.reducer
export const {
    changeTodolistFilter,
    changeTodolistEntityStatus,
} = slice.actions