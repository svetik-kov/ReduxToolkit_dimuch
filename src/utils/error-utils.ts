
import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'
import {setAppError, setAppStatus} from 'app/app-reducer';

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(setAppError({error:data.messages[0]})
    )
    } else {
        dispatch(setAppError({error:'Some error occurred'}))
    }
    dispatch(setAppStatus({status:'failed'}))
}

export const handleServerNetworkError = (error: { message: string }, dispatch: Dispatch) => {
    dispatch(setAppError({error:error.message ? error.message : 'Some error occurred'})
)
    dispatch(setAppStatus({status:'failed'}))
}



//https://gist.github.com/safronman/df79fdac4cf5e4b4a159da460163cdbc
/*import axios from "axios";
import {ResponseType} from 'api/todolists-api'
import { AppDispatch } from "app/store";
import {setAppError, setAppStatus} from 'app/app-reducer';
import {Dispatch} from 'redux';

export const handleServerAppError = <D>(data: ResponseType<D>, dispatch: Dispatch) => {
    if (data.messages.length) {
        dispatch(setAppError({error:data.messages[0]})
        )
    } else {
        dispatch(setAppError({error:'Some error occurred'}))
    }
    dispatch(setAppStatus({status:'failed'}))
}

export const handleServerNetworkError = (err: unknown, dispatch: Dispatch):void => {
    let errorMessage = "Some error occurred";

    // ❗Проверка на наличие axios ошибки
    if (axios.isAxiosError(err)) {
        // ⏺️ err.response?.data?.message - например получение тасок с невалидной todolistId
        // ⏺️ err?.message - например при создании таски в offline режиме
        errorMessage = err.response?.data?.message || err?.message || errorMessage;
        // ❗ Проверка на наличие нативной ошибки
    } else if (err instanceof Error) {
        errorMessage = `Native error: ${err.message}`;
        // ❗Какой-то непонятный кейс
    } else {
        errorMessage = JSON.stringify(err);
    }

    dispatch(setAppError({ error: errorMessage }));
    dispatch(setAppStatus({ status: "failed" }));
};*/
