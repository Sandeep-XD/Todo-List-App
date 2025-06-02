import React, { useState, useMemo, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import TodoCard from './cards/TodoCard'
import { fetchTodos } from '../features/todo/todoSlice'
import { useUser } from '@clerk/clerk-react'
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const TodoList = ({ currentUser, dashboardFilter }) => {

  const todoState = useSelector((state) => state.todoReducer);
  const { todos, status, error } = todoState;
  const dispatch = useDispatch();
  const currentUserId = currentUser?.id || null;

  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  const [filterPriority, setFilterPriority] = useState('all'); // 'all', 'low', 'mid', 'high'
  const [filterUser, setFilterUser] = useState('currentUser'); // Default to showing only current user's todos
  const [filterDueDate, setFilterDueDate] = useState('all'); // 'all', 'today', 'thisWeek', 'overdue'
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'dueDate', 'priority'
  const [currentPage, setCurrentPage] = useState(1);
  const todosPerPage = 5;

  // Ref to hold individual todo card refs
  const todoCardRefs = React.useRef(new Map());

  const setTodoCardRef = (todoId, node) => {
    if (node) {
      todoCardRefs.current.set(todoId, node);
    } else {
      todoCardRefs.current.delete(todoId);
    }
  };

  useEffect(() => {
    // Fetch only the current user's todos
    if (status === 'idle' && currentUserId) { // Fetch initially when idle and user is available
        dispatch(fetchTodos(currentUserId));
    }
  }, [status, dispatch, currentUserId]); // Depend on currentUserId

  // Update local filterStatus when dashboardFilter changes
  useEffect(() => {
    if (dashboardFilter !== null) {
      setFilterStatus(dashboardFilter);
    } else {
      // Optionally reset to 'all' or keep previous state if dashboard filter is cleared
      // setFilterStatus('all'); 
    }
  }, [dashboardFilter]);

  const filteredAndSortedTodos = useMemo(() => {
    let filteredTodos = todos; // Start with the fetched todos

    // Apply filtering based on status and priority
    // Prioritize dashboardFilter if active, otherwise use local filterStatus
    const currentFilterStatus = dashboardFilter !== null ? dashboardFilter : filterStatus;

    if (currentFilterStatus === 'completed') {
      filteredTodos = filteredTodos.filter(todo => todo.completed);
    } else if (currentFilterStatus === 'pending') {
      filteredTodos = filteredTodos.filter(todo => !todo.completed);
    }

    if (filterPriority !== 'all') {
      filteredTodos = filteredTodos.filter(todo => todo.priority === filterPriority);
    }

    // Note: User filtering is now handled primarily by fetching with userId in the thunk
    // This local filterUser state is only used to determine which userId to fetch initially ('all' or 'currentUser')

    // Sort todos
    const sortedTodos = [...filteredTodos].sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'dueDate') {
        // Handle potential null or undefined due dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // Null due dates come last
        if (!b.dueDate) return -1; // Null due dates come last
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, mid: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

    return sortedTodos;
  }, [todos, filterStatus, filterPriority, sortBy, dashboardFilter]);

  // Pagination logic
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredAndSortedTodos.slice(indexOfFirstTodo, indexOfLastTodo);

  const totalPages = Math.ceil(filteredAndSortedTodos.length / todosPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  let content;

  if (status === 'loading') {
    content = (
      <div className="flex flex-col items-center justify-center py-12 bg-blue-50 rounded-lg text-blue-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <h3 className="mt-5 text-xl font-semibold">Loading Todos...</h3>
        <p className="mt-2 text-sm text-blue-600">Fetching your tasks, please wait.</p>
      </div>
    );
  } else if (status === 'succeeded') {
    content = currentTodos.length > 0 ? (
      <TransitionGroup component="div" className="space-y-4">
        {currentTodos.map((todo) => (
          <CSSTransition
            key={todo.id}
            nodeRef={(node) => setTodoCardRef(todo.id, node)}
            timeout={300}
            classNames="todo-item"
          >
            <TodoCard todo={todo} ref={(node) => setTodoCardRef(todo.id, node)} />
          </CSSTransition>
        ))}
      </TransitionGroup>
    ) : (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-100 rounded-lg text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold">No Todos Found</h3>
        <p className="mt-2 text-sm text-gray-500">Looks like this list is empty.</p>
      </div>
    );
  } else if (status === 'failed') {
    content = (
      <div className="flex flex-col items-center justify-center py-12 bg-red-100 rounded-lg text-red-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-4 text-xl font-semibold">Error Loading Todos</h3>
        <div className="mt-2 text-center text-sm text-red-600">{error || 'Failed to load todos.'}</div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg shadow-md w-full mx-auto md:mx-0" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className='text-2xl font-bold' style={{ color: 'var(--color-text-primary)' }}>Todo List</h2>
        <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 w-full md:w-auto mt-4 sm:mt-0">
           <div className="w-full sm:w-auto flex flex-col items-start">
            <label htmlFor="filterStatus" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Status:</label>
            <select
              id="filterStatus"
              className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 ${filterStatus !== 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-800 dark:border-blue-800' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

           <div className="w-full sm:w-auto flex flex-col items-start">
            <label htmlFor="filterPriority" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Priority:</label>
            <select
              id="filterPriority"
              className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 ${filterPriority !== 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-800 dark:border-blue-800' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={filterPriority}
              onChange={(e) => {
                setFilterPriority(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="mid">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

           {/* User filter removed - showing only current user todos */}

          <div className="w-full sm:w-auto flex flex-col items-start">
            <label htmlFor="filterDueDate" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Due Date:</label>
            <select
              id="filterDueDate"
              className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 ${filterDueDate !== 'all' ? 'border-blue-500 bg-blue-50 dark:bg-blue-800 dark:border-blue-800' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={filterDueDate}
              onChange={(e) => {
                setFilterDueDate(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">All Due Dates</option>
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="w-full sm:w-auto flex flex-col items-start">
            <label htmlFor="sort" className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>Sort by:</label>
            <select
              id="sort"
              className={`w-full px-3 py-1 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-8 ${sortBy !== 'createdAt' ? 'border-blue-500 bg-blue-50 dark:bg-blue-800 dark:border-blue-800' : 'border-gray-300 dark:border-gray-600'}`} style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Creation Date</option>
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {content}
      </div>
      {status === 'succeeded' && filteredAndSortedTodos.length > todosPerPage && (
        <div className="flex justify-center items-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${currentPage === pageNumber ? 'bg-blue-600 text-white dark:bg-blue-400' : 'text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800'}`}
                disabled={currentPage === pageNumber}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-surface)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default TodoList