import {tasksReducer} from 'features/TodolistsList/tasks-reducer';
import {todolistsReducer} from 'features/TodolistsList/todolists-reducer';
import {AnyAction, combineReducers} from 'redux'
import {ThunkAction} from 'redux-thunk'
import {appReducer} from './app-reducer'
import {authReducer} from 'features/Login/auth-reducer'
import {configureStore} from '@reduxjs/toolkit';
import {useDispatch} from 'react-redux';

// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния
const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})
// непосредственно создаём store
//export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
export const store = configureStore({
    reducer: rootReducer,
    //middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(thunkMiddleware)
})
// определить автоматически тип всего объекта состояния

export type AppRootStateType = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootStateType, unknown, AnyAction>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch:()=>AppDispatch=useDispatch

//export type AppStateType = ReturnType<typeof store.getState>
//export const useAppDispatch:()=>AppDispatch=useDispatch
//export type AppThunkDispatch = ThunkDispatch<AppStateType, unknown, AnyAction>
//export const useAppSelector: TypedUseSelectorHook<AppStateType> = useSelector

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store;
