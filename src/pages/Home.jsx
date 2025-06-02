import React, { useState } from 'react'
import TodoList from '../components/TodoList'
import TodoForm from '../components/forms/TodoForm'
import Dashboard from '../components/dashboard/Dashboard'
import { useUser } from '@clerk/clerk-react'
// import { useSelector } from 'react-redux'


const Home = () => {
  const { user: currentUser } = useUser(); // Rename current user for clarity
  const [dashboardFilter, setDashboardFilter] = useState(null); // State to hold filter applied from dashboard

  const handleDashboardFilterSelect = (filter) => {
    setDashboardFilter(filter);
  };

  // const [displayedTodos, setDisplayedTodos] = useState([]);
  // const { status, error } = useSelector((state) => state.todoReducer);

  // const handleFilterSortChange = useCallback((filteredSortedTodos) => {
  //   setDisplayedTodos(filteredSortedTodos);
  // }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard onFilterSelect={handleDashboardFilterSelect} />
      <div className='flex flex-col md:flex-row gap-8'>
        <div className="w-full md:w-1/3">
          <TodoForm currentUser={currentUser} />
        </div>
        <div className="w-full md:w-2/3">
          <TodoList currentUser={currentUser} dashboardFilter={dashboardFilter} />
        </div>
      </div>
    </div>
  )
}

export default Home