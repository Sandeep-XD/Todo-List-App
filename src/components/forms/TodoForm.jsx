// TodoForm.js
import React, { useState } from 'react';
import { useDispatch , useSelector } from 'react-redux';
import { createTodo } from '../../features/todo/todoSlice';
import { useUser } from '@clerk/clerk-react';
import { FiCheckCircle } from 'react-icons/fi'; // Import success icon


const TodoForm = ({ currentUser }) => {
  // const {user} = useUser(); // User is now received as currentUser prop
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({}); // State for validation errors

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    }
    // Add other validation rules here if needed (e.g., dueDate format)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true);
    setShowSuccess(false); // Hide previous success message
    
    const assignToUserId = currentUser?.id || null;
    const assignToUserName = currentUser?.fullName || null;

    try {
      await dispatch(
        createTodo({
          title,
          description,
          priority,
          completed: false,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null, // Format date for Appwrite
          user: {
            id: assignToUserId,
            name: assignToUserName
          },
        })
      ).unwrap();

      // Clear form fields on successful submission
      setTitle('');
      setDescription('');
      setPriority('low');
      setDueDate('');
      setShowSuccess(true); // Show success message
      // Optionally hide success message after a few seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error("Failed to create todo:", error);
      // Optionally display an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClassName = "w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400";
  const labelBaseClassName = "block text-sm font-semibold mb-2 transition-colors duration-200";

  return (
    <div className="p-8 rounded-lg shadow-xl w-full max-w-md mx-auto" style={{ backgroundColor: 'var(--color-surface)' }}>
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: 'var(--color-text-primary)' }}>Create New Todo</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelBaseClassName} htmlFor="title" style={{ color: 'var(--color-text-primary)' }}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            className={`${inputBaseClassName} dark:placeholder-gray-500`} style={{ borderColor: errors.title ? 'var(--color-error)' : 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              // Clear error when user starts typing
              if (errors.title) {
                setErrors({ ...errors, title: null });
              }
            }}
            required
            placeholder="Enter todo title"
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className={labelBaseClassName} htmlFor="description" style={{ color: 'var(--color-text-primary)' }}>
            Description
          </label>
          <textarea
            className={`${inputBaseClassName} dark:placeholder-gray-500`} style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            placeholder="Enter todo description (optional)"
          />
        </div>

        <div>
          <label className={labelBaseClassName} htmlFor="dueDate" style={{ color: 'var(--color-text-primary)' }}>
            Due Date and Time
          </label>
          <input
            className={inputBaseClassName} style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div>
          <label className={labelBaseClassName} htmlFor="priority" style={{ color: 'var(--color-text-primary)' }}>
            Priority
          </label>
          <select
            className={inputBaseClassName} style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="mid">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            className="w-full font-bold py-3 px-4 rounded-md transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Todo...' : 'Add Todo'}
          </button>
        </div>
        {showSuccess && (
          <div className="flex items-center justify-center mt-4 font-semibold" style={{ color: 'var(--color-secondary)' }}>
            <FiCheckCircle className="mr-2" /> Todo added successfully!
          </div>
        )}
      </form>
    </div>
  );
};

export default TodoForm;