import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, TextField, Typography, Paper } from '@mui/material';
import { TodoItem } from './todo';
import TodoList from './TodoList';
import CalendarView from './CalendarView';
import TodoInput from './TodoInput';
import { fetchAllTodos, addTodo, updateTodo, deleteTodo } from './todoService';
import { useNavigate } from 'react-router-dom';

const today = new Date();
const midnightToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

const MainLayout = () => {
  const [selectedDate, setSelectedDate] = useState(midnightToday);
  const [todos, setTodos] = useState<Record<string, TodoItem[]>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const navigate = useNavigate();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const currentKey = formatDate(selectedDate);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("user_email");

    if (!token || !userEmail) {
    alert("로그인이 필요합니다.");
    navigate("/signin");
    return;
    }
    fetchAllTodos().then((allTodos) => {
      if (!Array.isArray(allTodos)) {
        console.error('🚨 allTodos is not an array:', allTodos);
        return;
      }

      const grouped: Record<string, TodoItem[]> = {};
      allTodos.forEach((todo: TodoItem) => {
        const key = todo.date as string;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(todo);
      });
      setTodos(grouped);
    });
  }, []);

  const handleAdd = async (text: string, category?: string, icon?: string) => {
    const user_id = localStorage.getItem('user_email');
    const newTodo: TodoItem = {
      id: Date.now(),
      text,
      completed: false,
      date: currentKey,
      category,
      icon,
      important: false,
      user_id : user_id || ''
    };
    await addTodo(newTodo);
    setTodos((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), newTodo],
    }));
  };

  const handleToggle = async (id: number) => {
    const todo = (todos[currentKey] || []).find((t) => t.id === id);
    if (!todo) return;
    await updateTodo(id, { completed: !todo.completed });
    setTodos((prev) => ({
      ...prev,
      [currentKey]: prev[currentKey].map((t) => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  };

  const handleDelete = async (id: number) => {
    await deleteTodo(id);
    setTodos((prev) => ({
      ...prev,
      [currentKey]: prev[currentKey].filter((t) => t.id !== id),
    }));
  };

  const handleUpdate = async (id: number, update: Partial<TodoItem> | string) => {
    const payload = typeof update === 'string' ? { text: update } : update;
    await updateTodo(id, payload);
    setTodos((prev) => ({
      ...prev,
      [currentKey]: prev[currentKey].map((t) => t.id === id ? { ...t, ...payload } : t),
    }));
  };

  const filteredTodos = (todos[currentKey] || []).filter(todo => {
    const matchSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === '전체' || todo.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const allCategories = Array.from(
    new Set((todos[currentKey] || []).map(todo => todo.category).filter(Boolean))
  );

  const total = filteredTodos.length;
  const completed = filteredTodos.filter(todo => todo.completed).length;
  const important = filteredTodos.filter(todo => todo.important).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9f8ff' }}>
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#ffffff', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: '#6f5df4', mb: 1 }}>할일 목록</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>2025년 ✨</Typography>
        <CalendarView date={selectedDate} onChange={setSelectedDate} todos={todos} />
      </Box>

      <Box sx={{ flex: 1, p: 4, position: 'relative' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>📋 Feed</Typography>

        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2, backgroundColor: '#f0f0ff' }}>
          <Typography variant="subtitle1">📊 오늘의 통계</Typography>
          <Typography variant="body2">총 할 일: {total}</Typography>
          <Typography variant="body2">완료: {completed}</Typography>
          <Typography variant="body2">중요 표시: {important}</Typography>
          <Typography variant="body2">완료율: {percentage}%</Typography>
        </Paper>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField fullWidth placeholder="검색어 입력" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>카테고리</InputLabel>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} label="카테고리">
              <MenuItem value="전체">전체</MenuItem>
              {allCategories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
            </Select>
          </FormControl>
        </Box>

        <TodoInput onAdd={handleAdd} />
        <TodoList todos={filteredTodos} onToggle={handleToggle} onDelete={handleDelete} onUpdate={handleUpdate} />

        <Box component="img" src="https://undraw.co/api/illustrations/undraw_to_do_list_re_9nt7.svg" alt="todo illust" sx={{ position: 'absolute', bottom: 16, right: 16, width: 140, opacity: 0.3 }} />
      </Box>
    </Box>
  );
};

export default MainLayout;
