import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {AppRootStateType, useActions} from 'app/store'
import {TodolistDomainType} from './todolists-reducer'
import {TasksStateType} from './tasks-reducer'
import {Grid, Paper} from '@mui/material'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'hooks/useAppDispatch';
import {selectIsLoggedIn} from 'features/Auth/selectors';
import {todolistsActions} from 'features/TodolistsList/index';


type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const dispatch = useAppDispatch()
    const {fetchTodolists, addTodolistTC} = useActions(todolistsActions)

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        fetchTodolists()
    }, [])


    const addTodolist = useCallback((title: string) => {
        addTodolistTC({title})

    }, [dispatch])

    if (!isLoggedIn) {
        return <Navigate to={'/login'}/>
    }

    return <>
        <Grid container style={{padding: '20px'}}>
            <AddItemForm addItem={addTodolist}/>
        </Grid>
        <Grid container spacing={3} style={{flexWrap:'nowrap', overflowX:'scroll'}}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <div style={{width: '300px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                demo={demo}
                            />
                        </div>
                    </Grid>
                })
            }
        </Grid>
    </>
}
