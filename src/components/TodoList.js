import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, TextField, Button, List, ListItem, ListItemText, IconButton, Checkbox } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import "./TodoList.css";

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [task, setTask] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isDueDateChecked, setIsDueDateChecked] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5001/todos')
            .then((res) => {
                setTodos(res.data);
            })
            .catch((error) => {
                console.error('Error fetching todos:', error);
            });
    }, []);

    const addTodo = () => {
        if (task.trim() !== '') {
            const todoData = { task, dueDate: isDueDateChecked ? dueDate : null };

            axios.post('http://localhost:5001/todos', todoData)
                .then((res) => {
                    setTodos([...todos, res.data]);
                    setTask('');
                    setDueDate('');
                    setIsDueDateChecked(false);
                })
                .catch((error) => {
                    console.error('Error adding todo:', error);
                });
        }
    };

    const deleteTodo = (id) => {
        axios.delete(`http://localhost:5001/todos/${id}`)
            .then(() => {
                setTodos(todos.filter((todo) => todo.id !== id));
            })
            .catch((error) => {
                console.error('Error deleting todo:', error);
            });
    };

    const completeTodo = (id, currentCompletedStatus) => {
        const completedDate = currentCompletedStatus ? null : new Date().toISOString();
        const newStatus = !currentCompletedStatus;

        axios.patch(`http://localhost:5001/todos/${id}/complete`, { completed: newStatus, completedDate })
            .then(() => {
                setTodos(todos.map(todo =>
                    todo.id === id ? { ...todo, completed: newStatus, completedDate } : todo
                ));
            })
            .catch((error) => console.error('Error completing todo:', error));
    };

    return (
        <Container className="todo-container">
            <h1>📝 To-Do List</h1>
            <div className="form">
                <TextField
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    label="New Task"
                    fullWidth
                />
                <div className="due-date-section">
                    <label htmlFor="due-date-checkbox">Set Due Date</label> {/* Label added here */}

                    <Checkbox
                        checked={isDueDateChecked}
                        onChange={(e) => setIsDueDateChecked(e.target.checked)}
                        color="primary"
                    />

                    {isDueDateChecked && (
                        <TextField
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            label="Due Date"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                    )}
                </div>
                <Button onClick={addTodo} variant="contained" className="add-button">Add Task</Button>
            </div>
            <List>
                {todos.length > 0 ? (
                    todos.map((todo) => (
                        <ListItem
                            key={todo.id}
                            className={todo.completed ? 'completed' : ''}
                            secondaryAction={
                                <>
                                    <IconButton edge="end" onClick={() => deleteTodo(todo.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton edge="end" onClick={() => completeTodo(todo.id, todo.completed)}>
                                        <CheckCircleIcon style={{ color: todo.completed ? '#4caf50' : '#888' }} />
                                    </IconButton>
                                </>
                            }>
                            <ListItemText primary={todo.task} secondary={todo.dueDate ? `Due: ${todo.dueDate}` : ''} />
                        </ListItem>
                    ))
                ) : (
                    <ListItem>No todos available.</ListItem>
                )}
            </List>
        </Container>
    );
};

export default TodoList;
