import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useUser } from '@clerk/clerk-react';
import { fetchTodos } from '../../features/todo/todoSlice';

const Dashboard = ({ onFilterSelect }) => {
  const { todos, status } = useSelector((state) => state.todoReducer);
  const { user } = useUser();
  const dispatch = useDispatch();

  const totalTodos = todos.length;
  const completedTodos = todos.filter(todo => todo.completed).length;
  const pendingTodos = totalTodos - completedTodos;

  return (
    <div className="p-4 sm:p-6 rounded-lg shadow-md mb-6 flex flex-col md:flex-row justify-between items-center" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="mb-4 md:mb-0 flex-grow">
        <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Welcome, {user?.firstName || 'User'}!</h2>
        {user && (
          <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {/* Removed Name detail */}
          </div>
        )}
      </div>
      <div className="mt-4 md:mt-0 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto items-center">
         <div
           className="p-4 rounded-md shadow-sm hover:shadow-md text-center cursor-pointer transition-all duration-200 flex flex-col items-center" style={{ backgroundColor: 'var(--color-primary)' }}
           onClick={() => onFilterSelect('all')}
         >
           <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-surface)' }}>Total</h3>
           <p className="text-2xl font-bold" style={{ color: 'var(--color-surface)' }}>{totalTodos}</p>
         </div>
         <div
           className="p-4 rounded-md shadow-sm hover:shadow-md text-center cursor-pointer transition-all duration-200 flex flex-col items-center" style={{ backgroundColor: 'var(--color-secondary)' }}
           onClick={() => onFilterSelect('completed')}
         >
           <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-surface)' }}>Completed</h3>
           <p className="text-2xl font-bold" style={{ color: 'var(--color-surface)' }}>{completedTodos}</p>
         </div>
         <div
           className="p-4 rounded-md shadow-sm hover:shadow-md text-center cursor-pointer transition-all duration-200 flex flex-col items-center" style={{ backgroundColor: 'var(--color-accent)' }}
           onClick={() => onFilterSelect('pending')}
         >
           <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-surface)' }}>Pending</h3>
           <p className="text-2xl font-bold" style={{ color: 'var(--color-surface)' }}>{pendingTodos}</p>
         </div>
       </div>
    </div>
  );
};

export default Dashboard; 