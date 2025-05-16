import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


interface Props {
  onAdd: (text: string, category?: string, icon?: string) => void;
}

const emojiOptions = ['📚', '🔥', '🎉', '💼', '💡', '📝', '📌', '💖'];

const TodoInput: React.FC<Props> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('');
  const [icon, setIcon] = useState('📌');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim(), category.trim(), icon);
    setText('');
    setCategory('');
    setIcon('📌');
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={2}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        px: 2,
        py: 2,
        borderRadius: 3,
        backgroundColor: '#f6f4ff',
        mb: 3,
      }}
    >
      <TextField
        placeholder="할 일을 입력하세요 ✏️"
        variant="standard"
        value={text}
        onChange={(e) => setText(e.target.value)}
        InputProps={{ disableUnderline: true }}
      />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          placeholder="카테고리 (예: GDSC)"
          variant="standard"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          InputProps={{ disableUnderline: true }}
          fullWidth
        />

        <FormControl variant="standard" sx={{ minWidth: 80 }}>
          <InputLabel shrink>아이콘</InputLabel>
          <Select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            disableUnderline
          >
            {emojiOptions.map((emj) => (
              <MenuItem key={emj} value={emj}>
                {emj}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton
          type="submit"
          sx={{
            backgroundColor: '#6f5df4',
            color: '#fff',
            '&:hover': { backgroundColor: '#5b4bd0' },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default TodoInput;
