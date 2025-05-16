export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
  date?: string;
  category?: string; // ex) "GDSC", "할일", "JBBP"
  icon?: string;     // ex) "📚", "🔥", "🛠"
  important?: boolean
}