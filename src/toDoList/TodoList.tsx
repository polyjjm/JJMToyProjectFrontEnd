import React, { useState } from 'react';
import {
  List,
  Paper,
  IconButton,
  Typography,
  TextField,
  Box,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Button,
} from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { TodoItem } from './todo';

interface Props {
  todos: TodoItem[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate?: (id: number, update: Partial<TodoItem> | string) => void;
}

const TodoList: React.FC<Props> = ({ todos, onToggle, onDelete, onUpdate }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuTodoId, setMenuTodoId] = useState<number | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setMenuTodoId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuTodoId(null);
  };

  const handleEdit = (id: number, text: string) => {
    console.log('✏️ 수정 시작:', id, text);
    setEditingId(id);
    setEditText(text);
    handleMenuClose();
  };

  const handleEditSubmit = () => {
    console.log('📝 수정 완료 시도:', editingId, editText);
    if (editingId !== null && editText.trim() && onUpdate) {
      onUpdate(editingId, editText.trim());
    }
    setEditingId(null);
    setEditText('');
  };

  if (todos.length === 0) {
    return (
      <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: '#999' }}>
        💤 오늘은 할 일이 없어요!
      </Typography>
    );
  }

  const grouped = todos.reduce((acc: Record<string, TodoItem[]>, todo) => {
    const key = todo.category || '기타';
    if (!acc[key]) acc[key] = [];
    acc[key].push(todo);
    return acc;
  }, {});

  const handleGroupToggle = (groupItems: TodoItem[], completeAll: boolean) => {
    if (!onUpdate) return;
    groupItems.forEach((todo) => {
      if (todo.completed !== completeAll) {
        onUpdate(todo.id, { completed: completeAll });
      }
    });
  };

  const handleCompleteToggle = (id: number, completed: boolean) => {
    if (onUpdate) onUpdate(id, { completed: !completed });
    handleMenuClose();
  };

  const handleToggleImportant = (id: number, important: boolean = false) => {
    if (onUpdate) onUpdate(id, { important: !important });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Object.entries(grouped).map(([category, items]) => {
        const allDone = items.every((item) => item.completed);

        const sortedItems = [...items].sort((a, b) => {
          if (a.important === b.important) return 0;
          return a.important ? -1 : 1;
        });

        return (
          <Paper key={category} sx={{ p: 2.5, borderRadius: 3, backgroundColor: '#fafafa' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Chip
                size="small"
                label={<span>{items[0].icon || '📌'} <strong>{category}</strong></span>}
                sx={{ backgroundColor: '#f1effc', color: '#6f5df4', fontWeight: 500, fontSize: '0.8rem' }}
              />
              <Button size="small" variant="text" onClick={() => handleGroupToggle(items, !allDone)}>
                {allDone ? '↩ 전체 해제' : '✔ 전체 완료'}
              </Button>
            </Box>

            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {sortedItems.map((todo) => (
                <Box
                  key={todo.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease-in-out',
                    opacity: todo.completed ? 0.5 : 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleToggleImportant(todo.id, todo.important)}>
                      {todo.important ? (
                        <StarIcon fontSize="small" sx={{ color: '#f5b400' }} />
                      ) : (
                        <StarBorderIcon fontSize="small" sx={{ color: '#ccc' }} />
                      )}
                    </IconButton>

                    {editingId === todo.id ? (
                      <TextField
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleEditSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSubmit();
                          if (e.key === 'Escape') {
                            setEditingId(null);
                            setEditText('');
                          }
                        }}
                        variant="standard"
                        fullWidth
                        autoFocus
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        onDoubleClick={() => handleEdit(todo.id, todo.text)}
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#bbb' : '#333',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease-in-out',
                        }}
                      >
                        {todo.text}
                      </Typography>
                    )}

                    {todo.completed && (
                      <CheckCircleIcon fontSize="small" sx={{ color: '#6f5df4' }} />
                    )}
                  </Box>

                  <IconButton size="small" onClick={(e) => handleMenuOpen(e, todo.id)}>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </List>
          </Paper>
        );
      })}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const selected = todos.find((t) => t.id === menuTodoId);
            if (selected) handleEdit(selected.id, selected.text);
          }}
        >
          ✏️ 수정하기
        </MenuItem>
        <MenuItem
          onClick={() => {
            const selected = todos.find((t) => t.id === menuTodoId);
            if (selected) handleCompleteToggle(selected.id, selected.completed);
          }}
        >
          ✅ {todos.find((t) => t.id === menuTodoId)?.completed ? '미완료로 변경' : '할 일 완료'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTodoId !== null) onDelete(menuTodoId);
            handleMenuClose();
          }}
        >
          🗑 삭제하기
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TodoList;
