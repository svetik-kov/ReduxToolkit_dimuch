import {asyncAction as tasksAsyncActions} from './tasks-reducer'
import {asyncAction as todolistsAsyncActions, slice} from './todolists-reducer'



const todolistsActions = {
    ...todolistsAsyncActions,
    ...slice.actions
}
const tasksActions = {
    ...tasksAsyncActions
}
export {
    tasksActions,
    todolistsActions,

}