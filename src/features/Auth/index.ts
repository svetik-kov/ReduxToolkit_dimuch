//import { Login } from './Login'
import * as authSelectors from './selectors'
import {asyncAction, slice}  from './auth-reducer'

const authActions={
    ...asyncAction,
    ...slice
}
export {
    authSelectors,
    //Login,
    authActions
}