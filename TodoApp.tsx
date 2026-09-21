import { useEffect, useMemo, useState } from "react";

type Filter = "all" | "active" | "completed";
type Todo = { id: number; title: string; completed: boolean; createdAt: number };
const STORAGE_KEY = "skycast-todos";

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  });
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)), [todos]);

  const addTodo = (event: React.FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTodos((current) => [{ id: Date.now(), title, completed: false, createdAt: Date.now() }, ...current]);
    setDraft("");
  };
  const toggleTodo = (id: number) => setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  const removeTodo = (id: number) => setTodos((current) => current.filter((todo) => todo.id !== id));
  const saveEdit = (id: number) => { const title = editingText.trim(); if (title) setTodos((current) => current.map((todo) => todo.id === id ? { ...todo, title } : todo)); setEditingId(null); };
  const visibleTodos = useMemo(() => todos.filter((todo) => filter === "all" || (filter === "active" ? !todo.completed : todo.completed)), [todos, filter]);
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return <main className="todo-shell">
    <section className="todo-card">
      <header className="todo-header"><div><p className="eyebrow">PERSONAL ORGANIZER</p><h1>My tasks<span>.</span></h1><p className="subtitle">A clear mind starts with a clear list.</p></div><div className="summary"><strong>{activeCount}</strong><span>open tasks</span></div></header>
      <form className="add-form" onSubmit={addTodo}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What needs to be done?" aria-label="New task" /><button type="submit">Add task <span>+</span></button></form>
      <div className="toolbar"><div className="filters" role="tablist" aria-label="Filter tasks">{(["all", "active", "completed"] as Filter[]).map((item) => <button key={item} className={filter === item ? "selected" : ""} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div><span>{completedCount} completed</span></div>
      <div className="todo-list">{visibleTodos.length === 0 ? <div className="empty"><div>✓</div><h2>{todos.length ? "Nothing here yet" : "Your list is empty"}</h2><p>{todos.length ? "Try another filter." : "Add a task above to get started."}</p></div> : visibleTodos.map((todo) => <article className={`todo-row ${todo.completed ? "done" : ""}`} key={todo.id}><button className="check" onClick={() => toggleTodo(todo.id)} aria-label={todo.completed ? "Mark as active" : "Mark as completed"}>{todo.completed ? "✓" : ""}</button>{editingId === todo.id ? <form className="edit-form" onSubmit={(event) => { event.preventDefault(); saveEdit(todo.id); }}><input autoFocus value={editingText} onChange={(event) => setEditingText(event.target.value)} onBlur={() => saveEdit(todo.id)} aria-label="Edit task" /></form> : <span className="todo-title">{todo.title}</span>}<div className="row-actions"><button onClick={() => { setEditingId(todo.id); setEditingText(todo.title); }} aria-label="Edit task">✎</button><button onClick={() => removeTodo(todo.id)} aria-label="Delete task">×</button></div></article>)}</div>
      {todos.length > 0 && <footer className="todo-footer"><span>{activeCount} {activeCount === 1 ? "task" : "tasks"} remaining</span>{completedCount > 0 && <button onClick={() => setTodos((current) => current.filter((todo) => !todo.completed))}>Clear completed</button>}</footer>}
    </section><p className="storage-note">🔒 Saved locally in your browser · Your tasks stay private on this device</p>
  </main>;
}
