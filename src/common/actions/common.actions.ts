import {createAction} from '@reduxjs/toolkit';
import {TasksStateType} from 'features/TodolistsList/tasks-reducer';
import {TodolistDomainType} from 'features/TodolistsList/todolists-reducer';

/*export type ClearTasksAndTodolists = {
    tasks: TasksStateType
    todolists: TodolistDomainType[]
}*/

export const clearTasksAndTodolists = createAction('common/clear-tasks-and-todolists')