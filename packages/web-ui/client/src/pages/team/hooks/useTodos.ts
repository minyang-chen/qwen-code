import { useState } from 'react';
import { Todo } from '../types/team.types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const loadTodos = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/todos', {
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      const data = await res.json();
      setTodos(data);
    } catch (err) {
      console.error('Failed to load todos');
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      const res = await fetch('http://localhost:3001/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ text: newTodo })
      });
      await res.json();
      setNewTodo('');
      loadTodos();
    } catch (err) {
      console.error('Failed to add todo');
    }
  };

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t._id === id);
      if (!todo) return;
      
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });
      loadTodos();
    } catch (err) {
      console.error('Failed to toggle todo');
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('team_session_token')}` }
      });
      loadTodos();
    } catch (err) {
      console.error('Failed to delete todo');
    }
  };

  const updateTodo = async (id: string, text: string) => {
    try {
      await fetch(`http://localhost:3001/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('team_session_token')}`
        },
        body: JSON.stringify({ text })
      });
      loadTodos();
    } catch (err) {
      console.error('Failed to update todo');
    }
  };

  const startEditing = (id: string) => {
    setTodos(todos.map(t => t._id === id ? { ...t, editing: true } : t));
  };

  const cancelEditing = (id: string) => {
    setTodos(todos.map(t => t._id === id ? { ...t, editing: false } : t));
  };

  return {
    todos,
    setTodos,
    newTodo,
    setNewTodo,
    loadTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    updateTodo,
    startEditing,
    cancelEditing
  };
}
