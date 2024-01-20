import React, {useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {AppRootStateType, useActions} from 'app/store'
import {changeTodolistFilter, FilterValuesType, TodolistDomainType} from './todolists-reducer'
import {TasksStateType} from './tasks-reducer'
import {TaskStatuses} from 'api/todolists-api'
import {Grid, Paper} from '@mui/material'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {Todolist} from './Todolist/Todolist'
import {Navigate} from 'react-router-dom'
import {useAppDispatch} from 'hooks/useAppDispatch';
import {selectIsLoggedIn} from 'features/Auth/selectors';
import {tasksActions, todolistsActions} from 'features/TodolistsList/index';


type PropsType = {
    demo?: boolean
}

export const TodolistsList: React.FC<PropsType> = ({demo = false}) => {
    const todolists = useSelector<AppRootStateType, Array<TodolistDomainType>>(state => state.todolists)
    const tasks = useSelector<AppRootStateType, TasksStateType>(state => state.tasks)
    const isLoggedIn = useSelector(selectIsLoggedIn)

    const dispatch = useAppDispatch()
    const {updateTaskTC, removeTaskTC, addTaskTC} = useActions(tasksActions)
    const {changeTodolistTitleTC, fetchTodolistsTC, removeTodolistTC, addTodolistTC} = useActions(todolistsActions)

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        fetchTodolistsTC()
    }, [])

    const removeTask = useCallback(function (id: string, todolistId: string) {
        removeTaskTC({taskId: id, todolistId})
    }, [])

    const addTask = useCallback(function (title: string, todolistId: string) {
        addTaskTC({title, todolistId})
    }, [])

    const changeStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        updateTaskTC({taskId: id, domainModel: {status}, todolistId: todolistId})
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        updateTaskTC({taskId: id, domainModel: {title: newTitle}, todolistId: todolistId})
    }, [])

    const changeFilter = useCallback(function (value: FilterValuesType, todolistId: string) {
        const action = changeTodolistFilter({id: todolistId, filter: value})
        dispatch(action)
    }, [])

    const removeTodolist = useCallback(function (id: string) {
        removeTodolistTC({todolistId: id})
    }, [])

    const changeTodolistTitle = useCallback(function (id: string, title: string) {
        changeTodolistTitleTC({id, title})
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
        <Grid container spacing={3}>
            {
                todolists.map(tl => {
                    let allTodolistTasks = tasks[tl.id]

                    return <Grid item key={tl.id}>
                        <Paper style={{padding: '10px'}}>
                            <Todolist
                                todolist={tl}
                                tasks={allTodolistTasks}
                                removeTask={removeTask}
                                changeFilter={changeFilter}
                                addTask={addTask}
                                changeTaskStatus={changeStatus}
                                removeTodolist={removeTodolist}
                                changeTaskTitle={changeTaskTitle}
                                changeTodolistTitle={changeTodolistTitle}
                                demo={demo}
                            />
                        </Paper>
                    </Grid>
                })
            }
        </Grid>
    </>
}
