import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from 'api/todolists-api'
import {FilterValuesType, TodolistDomainType} from '../todolists-reducer'
import {Button, IconButton, Paper} from '@mui/material'
import {Delete} from '@mui/icons-material'
import {useActions} from 'app/store';
import {tasksActions, todolistsActions} from 'features/TodolistsList/index';
import {OverridableStringUnion} from '@mui/types';
import {ButtonPropsColorOverrides} from '@mui/material/Button/Button';


type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
    demo?: boolean
}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {

    //const dispatch = useAppDispatch()
    const {changeTodolistFilter, removeTodolistTC, changeTodolistTitleTC} = useActions(todolistsActions)
    const {addTask, fetchTasks} = useActions(tasksActions)


    useEffect(() => {
        if (demo) {
            return
        }
        fetchTasks(props.todolist.id)
    }, [])

    const addTaskCallback = useCallback((title: string) => {
        addTask({title, todolistId: props.todolist.id})
    }, [props.todolist.id])

    const removeTodolist = () => {
        removeTodolistTC({todolistId: props.todolist.id})
    }
    const changeTodolistTitle = useCallback((title: string) => {
        changeTodolistTitleTC({id: props.todolist.id, title})
    }, [props.todolist.id])


    const onFilterButtonClickHandler = useCallback((filter: FilterValuesType) => changeTodolistFilter({
        filter: filter,
        id: props.todolist.id
    }), [props.todolist.id])

    let tasksForTodolist = props.tasks

    if (props.todolist.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }


    const renderFilterButton = (
        buttonFilter: FilterValuesType,
        color: OverridableStringUnion<'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
            ButtonPropsColorOverrides>,
        text: string) => {
        return <Button variant={props.todolist.filter === buttonFilter ? 'outlined' : 'text'}
                       onClick={() => onFilterButtonClickHandler(buttonFilter)}
                       color={color}>{text}
        </Button>
    }

    return <Paper style={{padding:'10px',position:'relative'}}>
        <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === 'loading'}
        style={{position:'absolute', right:'5px', top:'5px'}}
        >
            <Delete/>
        </IconButton>
        <h3><EditableSpan value={props.todolist.title} onChange={changeTodolistTitle}/>
          {/*  <IconButton onClick={removeTodolist} disabled={props.todolist.entityStatus === 'loading'}>
                <Delete/>
            </IconButton>*/}
        </h3>
        <AddItemForm addItem={addTaskCallback} disabled={props.todolist.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todolist.id}
                />)
            }
            {!tasksForTodolist.length && <div style={{padding:'10px',color:'grey'}}>No taks</div>}
        </div>
        <div style={{paddingTop: '10px'}}>
            {renderFilterButton('all', 'inherit', 'All')}
            {renderFilterButton('active', 'primary', 'Active')}
            {renderFilterButton('completed', 'secondary', 'Completed')}

        </div>
    </Paper>
})



