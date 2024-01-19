import {todolistsAPI, TodolistType} from 'api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatus,} from 'app/app-reducer'
import {handleServerNetworkError} from 'utils/error-utils'
import {createAsyncThunk, createSlice, current, PayloadAction} from '@reduxjs/toolkit';
import {clearTasksAndTodolists} from 'common/actions/common.actions';

//https://immerjs.github.io/immer/update-patterns/
const initialState: Array<TodolistDomainType> = []

const slice = createSlice({
    name: 'todolists',
    initialState: initialState,
    reducers: {
        /* removeTodolist: (state, action: PayloadAction<{ id: string }>) => {
             const index = state.findIndex(todo => todo.id === action.payload.id)
             if (index !== -1) state.splice(index, 1)
         },*/
       /* addTodolist: (state, action: PayloadAction<{ todolist: TodolistType }>) => {
            console.log(current(state))
            //return [{...action.todolist, filter: 'all', entityStatus: 'idle'}, ...state]
            const newTodolist: TodolistDomainType = {...action.payload.todolist, filter: 'all', entityStatus: 'idle'}
            state.unshift(newTodolist)
        },*/
       /* changeTodolistTitle: (state, action: PayloadAction<{ id: string, title: string }>) => {
            //return state.map(tl => tl.id === action.id ? {...tl, title: action.title} : tl)
            const index = state.findIndex(todo => todo.id === action.payload.id)
            if (index !== -1) state[index].title = action.payload.title
        },*/
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


export const fetchTodolistsTC = createAsyncThunk<{ todolists: Array<TodolistType> }>(`${slice.name}/fetchTodolists`,
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
// thunks
/*export const fetchTodolistsTC_ = (): AppThunk => {
    return (dispatch) => {
        dispatch(setAppStatus({status: 'loading'}))
        todolistsAPI.getTodolists()
            .then((res) => {
                dispatch(setTodolists({todolists: res.data}))
                dispatch(setAppStatus({status: 'succeeded'}))
            })
            .catch(error => {
                handleServerNetworkError(error, dispatch);
            })
    }
}*/

export const removeTodolistTC = createAsyncThunk<{id: string}, { todolistId: string }>(`${slice.name}/removeTodolist`,
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

export const addTodolistTC = createAsyncThunk<{ todolist: TodolistType }, { title: string }>(`${slice.name}/addTodolist`,
    async (param:{title: string}, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
           const res=await  todolistsAPI.createTodolist(param.title)
            dispatch(setAppStatus({status: 'succeeded'}))
            return {todolist: res.data.data.item}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

export const changeTodolistTitleTC = createAsyncThunk<{ id: string, title: string }, {id: string, title: string}>(`${slice.name}/changeTodolistTitle`,
    async (param:{id: string, title: string}, thunkAPI) => {
        const {dispatch, rejectWithValue} = thunkAPI
        dispatch(setAppStatus({status: 'loading'}))
        try {
            const res=await  todolistsAPI.updateTodolist(param.id, param.title)
            dispatch(setAppStatus({status: 'succeeded'}))
           return {id:param.id, title:param.title}
        } catch (e: any) {
            handleServerNetworkError(e, dispatch)
            return rejectWithValue(null)
        }
    })

/*export const changeTodolistTitleTC_ = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitle({id, title}))
            })
    }
}*/


export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}
type ThunkDispatch = Dispatch


export const todolistsReducer = slice.reducer
export const {
    //removeTodolist,
   // addTodolist,
   // changeTodolistTitle,
    changeTodolistFilter,
    changeTodolistEntityStatus,
    // setTodolists
} = slice.actions