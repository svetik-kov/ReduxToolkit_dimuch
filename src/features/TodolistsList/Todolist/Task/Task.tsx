import React, { ChangeEvent, useCallback } from 'react'
import { Checkbox, IconButton } from '@mui/material'
import { EditableSpan } from '../../../../components/EditableSpan/EditableSpan'
import { Delete } from '@mui/icons-material'
import { TaskStatuses, TaskType } from '../../../../api/todolists-api'
import {useActions} from 'app/store';
import {tasksActions, todolistsActions} from 'features/TodolistsList/index';

type TaskPropsType = {
	task: TaskType
	todolistId: string
	/*changeTaskStatus: (id: string, status: TaskStatuses, todolistId: string) => void
	changeTaskTitle: (taskId: string, newTitle: string, todolistId: string) => void
	removeTask: (param:{taskId: string, todolistId: string}) => void*/
}
export const Task = React.memo((props: TaskPropsType) => {

	const {removeTask, updateTask} = useActions(tasksActions)

/*	const changeTaskStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
		updateTask({taskId: id, domainModel: {status}, todolistId: todolistId})
	}, [])*/

	/*const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
		updateTask({taskId: id, domainModel: {title: newTitle}, todolistId: todolistId})
	}, [])*/


	const onClickHandler = useCallback(() => removeTask({taskId:props.task.id, todolistId:props.todolistId}), [props.task.id, props.todolistId]);

	const onChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
		let newIsDoneValue = e.currentTarget.checked
		updateTask({
			taskId: props.task.id,
			domainModel: {status:newIsDoneValue ? TaskStatuses.Completed : TaskStatuses.New},
			todolistId: props.todolistId})
		//changeTaskStatus(props.task.id, newIsDoneValue ? TaskStatuses.Completed : TaskStatuses.New, props.todolistId)
	}, [props.task.id, props.todolistId]);

	const onTitleChangeHandler = useCallback((newValue: string) => {
		updateTask({taskId: props.task.id, domainModel: {title: newValue}, todolistId: props.todolistId})
		//changeTaskTitle(props.task.id, newValue, props.todolistId)
	}, [props.task.id, props.todolistId]);

	return <div key={props.task.id} className={props.task.status === TaskStatuses.Completed ? 'is-done' : ''}>
		<Checkbox
			checked={props.task.status === TaskStatuses.Completed}
			color="primary"
			onChange={onChangeHandler}
		/>

		<EditableSpan value={props.task.title} onChange={onTitleChangeHandler}/>
		<IconButton onClick={onClickHandler}>
			<Delete/>
		</IconButton>
	</div>
})
