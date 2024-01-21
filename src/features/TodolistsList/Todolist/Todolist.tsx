import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from '../../../api/todolists-api'
import {TodolistDomainType} from '../todolists-reducer'
import {useAppDispatch} from '../../../hooks/useAppDispatch';
import {Button, IconButton} from '@mui/material'
import {Delete} from '@mui/icons-material'
import {useActions} from 'app/store';
import {tasksActions, todolistsActions} from 'features/TodolistsList/index';
import {fetchTasks} from 'features/TodolistsList/tasks-reducer';

type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
    // changeFilter: (value: FilterValuesType, todolistId: string) => void
    //addTask: (title: string, todolistId: string) => void
    //changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
    //changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
   // removeTask: (param: { taskId: string, todolistId: string }) => void
   // removeTodolist: (id: string) => void
   // changeTodolistTitle: (id: string, newTitle: string) => void
    demo?: boolean
}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {

    const dispatch = useAppDispatch()
    const {changeTodolistFilter, removeTodolistTC, changeTodolistTitleTC} = useActions(todolistsActions)
    const {updateTask, removeTask, addTask} = useActions(tasksActions)

    const changeTaskStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        updateTask({taskId: id, domainModel: {status}, todolistId: todolistId})
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        updateTask({taskId: id, domainModel: {title: newTitle}, todolistId: todolistId})
    }, [])

    useEffect(() => {
        if (demo) {
            return
        }
        const thunk = fetchTasks(props.todolist.id)
        dispatch(thunk)
    }, [])

    const addTaskCallback = useCallback((title: string) => {
        addTask({title,todolistId: props.todolist.id})
    }, [ props.todolist.id])

    const removeTodolist = () => {
        removeTodolistTC({todolistId:props.todolist.id})
    }
    const changeTodolistTitle = useCallback((title: string) => {
        changeTodolistTitleTC({id:props.todolist.id, title})
    }, [props.todolist.id])

 /*   const onAllClickHandler = useCallback(() => props.changeFilter('all', props.todolist.id), [props.todolist.id, props.changeFilter])
    const onActiveClickHandler = useCallback(() => props.changeFilter('active', props.todolist.id), [props.todolist.id, props.changeFilter])
    const onCompletedClickHandler = useCallback(() => props.changeFilter('completed', props.todolist.id), [props.todolist.id, props.changeFilter])*/
    const onAllClickHandler = useCallback(() =>  changeTodolistFilter({filter:'all',id: props.todolist.id}), [props.todolist.id])
    const onActiveClickHandler = useCallback(() =>  changeTodolistFilter({filter:'active',id: props.todolist.id}), [props.todolist.id])
    const onCompletedClickHandler = useCallback(() =>  changeTodolistFilter({filter:'completed',id: props.todolist.id}), [props.todolist.id])

    let tasksForTodolist = props.tasks

    if (props.todolist.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    return <div>
        <h3><EditableSpan value={props.todolist.title} onChange={changeTodolistTitle}/>
            <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === 'loading'}>
                <Delete/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTaskCallback} disabled={props.todolist.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todolist.id}
                                                removeTask={removeTask}
                                                changeTaskTitle={changeTaskTitle}
                                                changeTaskStatus={changeTaskStatus}
                />)
            }
        </div>
        <div style={{paddingTop: '10px'}}>
            <Button variant={props.todolist.filter === 'all' ? 'outlined' : 'text'}
                    onClick={onAllClickHandler}
                    color={'inherit'}
            >All
            </Button>
            <Button variant={props.todolist.filter === 'active' ? 'outlined' : 'text'}
                    onClick={onActiveClickHandler}
                    color={'primary'}>Active
            </Button>
            <Button variant={props.todolist.filter === 'completed' ? 'outlined' : 'text'}
                    onClick={onCompletedClickHandler}
                    color={'secondary'}>Completed
            </Button>
        </div>
    </div>
})


