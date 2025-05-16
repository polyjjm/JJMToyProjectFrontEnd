import React from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box } from '@mui/material';
import { TodoItem } from './todo';
import './CustomCalendar.css';

interface Props {
  date: Date;
  onChange: (value: Date) => void;
  todos: Record<string, TodoItem[]>;
}

const CalendarView: React.FC<Props> = ({ date, onChange, todos }) => {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const tileContent = ({ date: tileDate }: { date: Date }) => {
    const key = formatDate(tileDate);
    const dayTodos = todos[key];

    if (!dayTodos || dayTodos.length === 0) return null;

    const allDone = dayTodos.every(todo => todo.completed);
    const anyDone = dayTodos.some(todo => todo.completed);

    return (
      <div className="emoji-indicator">
        {allDone ? '✔️' : anyDone ? '📝' : '❗'}
      </div>
    );
  };

  return (
    <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
      <Calendar
        onChange={(value) => onChange(value as Date)}
        value={date}
        locale="ko-KR"
        className="custom-calendar"
        tileContent={tileContent}
      />
    </Box>
  );
};

export default CalendarView;
