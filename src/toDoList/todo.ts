export type TodoPriority = 'HIGH' | 'MID' | 'LOW';

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date?: string; // also doubles as the due date shown in the dashboard todo widget
  category?: string; // ex) "GDSC", "할일", "JBBP"
  icon?: string;     // ex) "📚", "🔥", "🛠"
  important?: boolean
  priority?: TodoPriority
  user_id : string
}