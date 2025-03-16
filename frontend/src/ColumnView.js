// src/ColumnView.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, Plus, MoreVertical, Pencil, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const WarehouseDashboard = () => {
  // Theme state with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
  });

  // Date related states
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datesWithTasks, setDatesWithTasks] = useState([
    new Date(2025, 0, 29), // Sample dates with tasks
    new Date(2025, 0, 28),
    new Date(2025, 0, 25),
  ]);

  // Tasks state with column organization
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, text: 'Check inventory in Aisle A', priority: 'high', date: new Date() },
      { id: 2, text: 'Restock shipping supplies', priority: 'medium', date: new Date() }
    ],
    inProgress: [
      { id: 3, text: 'Update receiving log', priority: 'low', date: new Date() }
    ],
    complete: [
      { id: 4, text: 'Morning equipment check', priority: 'high', date: new Date() }
    ]
  });

  // UI states
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Theme toggle handler
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on component mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Task management functions
  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: newTaskText,
      priority: 'medium',
      date: selectedDate
    };

    setTasks(prev => ({
      ...prev,
      todo: [...prev.todo, newTask]
    }));
    setNewTaskText('');

    // Add date to datesWithTasks if not already present
    if (!datesWithTasks.some(date => date.toDateString() === selectedDate.toDateString())) {
      setDatesWithTasks(prev => [...prev, selectedDate]);
    }
  };

  const deleteTask = (taskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(task => task.id !== taskId)
    }));
  };

  const moveTask = (taskId, fromColumn, toColumn) => {
    const task = tasks[fromColumn].find(t => t.id === taskId);
    if (!task) return;

    setTasks(prev => ({
      ...prev,
      [fromColumn]: prev[fromColumn].filter(t => t.id !== taskId),
      [toColumn]: [...prev[toColumn], task]
    }));
  };

  // Filter tasks by selected date
  const getFilteredTasks = (column) => {
    return tasks[column].filter(task => task.date.toDateString() === selectedDate.toDateString());
  };

  const TaskCard = ({ task, column }) => (
    <Card className="mb-3 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className={`w-2 h-2 rounded-full ${
            task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? 'bg-yellow-500' :
            'bg-green-500'
          }`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {format(task.date, 'MMM d, yyyy')}
          </span>
        </div>
        
        {editingTask === task.id ? (
          <Input
            value={task.text}
            onChange={(e) => {
              setTasks(prev => ({
                ...prev,
                [column]: prev[column].map(t =>
                  t.id === task.id ? { ...t, text: e.target.value } : t
                )
              }));
            }}
            onBlur={() => setEditingTask(null)}
            autoFocus
          />
        ) : (
          <p className="text-sm">{task.text}</p>
        )}
        
        <div className="flex justify-end mt-2 gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditingTask(task.id)}>
            <Pencil className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {column !== 'todo' && (
                <DropdownMenuItem onClick={() => moveTask(task.id, column, 'todo')}>
                  Move to Todo
                </DropdownMenuItem>
              )}
              {column !== 'inProgress' && (
                <DropdownMenuItem onClick={() => moveTask(task.id, column, 'inProgress')}>
                  Move to In Progress
                </DropdownMenuItem>
              )}
              {column !== 'complete' && (
                <DropdownMenuItem onClick={() => moveTask(task.id, column, 'complete')}>
                  Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => deleteTask(task.id, column)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  // Calendar modifiers for highlighting dates with tasks
  const modifiers = {
    hasTask: (date) =>
      datesWithTasks.some(taskDate => taskDate.toDateString() === date.toDateString())
  };

  const modifiersStyles = {
    hasTask: {
      backgroundColor: '#FEF08A',
      color: '#000000'
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto p-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || new Date())}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>

            {selectedDate.toDateString() !== new Date().toDateString() && (
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Input
              placeholder="Add new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              className="w-64"
            />
            <Button onClick={addTask}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Todo Column */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">To Do</h2>
            {getFilteredTasks('todo').map(task => (
              <TaskCard key={task.id} task={task} column="todo" />
            ))}
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">In Progress</h2>
            {getFilteredTasks('inProgress').map(task => (
              <TaskCard key={task.id} task={task} column="inProgress" />
            ))}
          </div>

          {/* Complete Column */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Complete</h2>
            {getFilteredTasks('complete').map(task => (
              <TaskCard key={task.id} task={task} column="complete" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
