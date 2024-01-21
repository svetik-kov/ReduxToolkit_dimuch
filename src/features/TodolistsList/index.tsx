import {asyncAction as tasksActions}  from './tasks-reducer'
import {asyncAction as todolistsAsyncActions} from './todolists-reducer'
import {slice} from './todolists-reducer'

const todolistsActions={
    ...todolistsAsyncActions,
    ...slice.actions
}

export {
    tasksActions,
    todolistsActions,

}