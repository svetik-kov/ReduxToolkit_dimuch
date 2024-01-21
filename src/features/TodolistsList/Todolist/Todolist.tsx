import React, {ReactNode, useCallback, useEffect} from 'react'
import {AddItemForm} from 'components/AddItemForm/AddItemForm'
import {EditableSpan} from 'components/EditableSpan/EditableSpan'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from 'api/todolists-api'
import {FilterValuesType, TodolistDomainType} from '../todolists-reducer'
import {Button, IconButton} from '@mui/material'
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
    const {updateTask, removeTask, addTask, fetchTasks} = useActions(tasksActions)

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

    /*   const onAllClickHandler = useCallback(() => props.changeFilter('all', props.todolist.id), [props.todolist.id, props.changeFilter])
       const onActiveClickHandler = useCallback(() => props.changeFilter('active', props.todolist.id), [props.todolist.id, props.changeFilter])
       const onCompletedClickHandler = useCallback(() => props.changeFilter('completed', props.todolist.id), [props.todolist.id, props.changeFilter])*/
    const onAllClickHandler = useCallback(() => changeTodolistFilter({
        filter: 'all',
        id: props.todolist.id
    }), [props.todolist.id])
    const onActiveClickHandler = useCallback(() => changeTodolistFilter({
        filter: 'active',
        id: props.todolist.id
    }), [props.todolist.id])
    const onCompletedClickHandler = useCallback(() => changeTodolistFilter({
        filter: 'completed',
        id: props.todolist.id
    }), [props.todolist.id])

    let tasksForTodolist = props.tasks

    if (props.todolist.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }


    const renderFilterButton = (onClick: () => void,
                                buttonFilter: FilterValuesType,
                                color: OverridableStringUnion<'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
                                    ButtonPropsColorOverrides>,
                                text: string) => {
        return <Button variant={props.todolist.filter === buttonFilter ? 'outlined' : 'text'}
                       onClick={onClick}
                       color={color}>{text}
        </Button>
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
            {/* <FilterButton onClick={onAllClickHandler}  color={'inherit'} selectedFilter={props.todolist.filter} buttonFilter={'all' }>All </FilterButton>
            <FilterButton onClick={onActiveClickHandler}  color={'primary'} selectedFilter={props.todolist.filter} buttonFilter={'active' }>Active </FilterButton>
            <FilterButton onClick={onCompletedClickHandler}  color={'inherit'} selectedFilter={props.todolist.filter} buttonFilter={ 'completed' }>Completed </FilterButton>*/}
            {renderFilterButton(onAllClickHandler,'all','inherit','All' )}
            {renderFilterButton(onActiveClickHandler,'active' ,'primary','Active' )}
            {renderFilterButton(onCompletedClickHandler,'completed','secondary','Completed' )}

           {/* <Button variant={props.todolist.filter === 'all' ? 'outlined' : 'text'}
                    onClick={onAllClickHandler}
                    color={'inherit'}
            >All
            </Button>*/}
          {/*  <Button variant={props.todolist.filter === 'active' ? 'outlined' : 'text'}
                    onClick={onActiveClickHandler}
                    color={'primary'}>Active
            </Button>
            <Button variant={props.todolist.filter === 'completed' ? 'outlined' : 'text'}
                    onClick={onCompletedClickHandler}
                    color={'secondary'}>Completed
            </Button>*/}
        </div>
    </div>
})


/*
type FilterButtonType = {
    onClick: () => void
    selectedFilter: FilterValuesType
    buttonFilter: FilterValuesType
    color: OverridableStringUnion<'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning',
        ButtonPropsColorOverrides>
    children: ReactNode
    text: string
}
const FilterButton: React.FC<FilterButtonType> = ({onClick, selectedFilter, buttonFilter, color, children}) => {
    return <Button variant={selectedFilter === buttonFilter ? 'outlined' : 'text'}
                   onClick={onClick}
                   color={color}>{children}
    </Button>
}*/
