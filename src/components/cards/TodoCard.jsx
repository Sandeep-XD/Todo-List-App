import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  updateTodo,
  deleteTodo,
} from "../../features/todo/todoSlice";
import { FiEdit, FiTrash2, FiSave, FiX, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const TodoCard = React.forwardRef(({ todo }, ref) => {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedDesc, setEditedDesc] = useState(todo.description);
  const [editedPriority, setEditedPriority] = useState(todo.priority);
  const [editedDueDate, setEditedDueDate] = useState(todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : "");
  const [editedCompleted, setEditedCompleted] = useState(todo.completed || false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const titleInputRef = useRef(null);

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);

  const handleToggle = async () => {
    setError(null);
    try {
      setIsUpdating(true);
      await dispatch(
        updateTodo({
          id: todo.id,
          completed: !todo.completed,
        })
      ).unwrap();
      setEditedCompleted(!editedCompleted);
    } catch (error) {
      console.error("Failed to toggle todo completion:", error);
      setError("Failed to toggle completion.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    setError(null);
    try {
      setIsUpdating(true);
      await dispatch(
        updateTodo({
          id: todo.id,
          title: editedTitle,
          description: editedDesc,
          priority: editedPriority,
          dueDate: editedDueDate,
          completed: editedCompleted,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
      setError("Failed to update todo.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (showConfirmDelete) {
      setError(null);
      try {
        setIsDeleting(true);
        await dispatch(deleteTodo(todo.id)).unwrap();
      } catch (error) {
        console.error("Failed to delete todo:", error);
        setError("Failed to delete todo.");
      } finally {
        setIsDeleting(false);
        setShowConfirmDelete(false);
      }
    } else {
      setShowConfirmDelete(true);
    }
  };

  const handleCancel = () => {
    setEditedTitle(todo.title);
    setEditedDesc(todo.description);
    setEditedPriority(todo.priority);
    setEditedDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : "");
    setEditedCompleted(todo.completed);
    setIsEditing(false);
    setError(null);
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
    setIsDeleting(false);
  };

  return (
    <div ref={ref} className={`relative mb-3 p-3 sm:p-4 rounded-lg shadow-sm transition-all duration-300 ease-in-out ${todo.completed ? 'opacity-75 border-l-4 border-green-500' : 'hover:shadow-md'}`} style={{ backgroundColor: 'var(--color-surface)', border: `1px solid ${todo.completed ? 'var(--color-secondary)' : 'var(--color-text-secondary)'}`, transform: `${todo.completed ? 'scale(0.98)' : 'scale(1)'}` }}>
      {(isUpdating || isDeleting) && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg z-10">
          <div className="flex items-center text-blue-600 font-semibold">
            <FiLoader className="animate-spin mr-2 text-xl" />
            {isUpdating ? 'Updating...' : 'Deleting...'}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-1 rounded mb-2 text-xs">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-start gap-3 flex-grow">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
            className="w-5 h-5 mt-1 accent-blue-500 cursor-pointer flex-shrink-0"
          />
          <div className="flex-1">
            {isEditing ? (
              <input
                ref={titleInputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full p-1 mb-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
              />
            ) : (
              <h3
                className={`font-semibold text-lg ${todo.completed ? "line-through text-gray-500" : "text-gray-500"}`}
              >
                {todo.title}
              </h3>
            )}

            {isEditing ? (
              <textarea
                value={editedDesc}
                onChange={(e) => setEditedDesc(e.target.value)}
                className="w-full p-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" style={{ borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-primary)' }}
                rows="2"
              />
            ) : (
              <p className={`text-sm text-gray-600 ${todo.completed ? "line-through dark:text-gray-400" : ""}`}>
                {todo.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0">
            {isEditing ? (
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value)}
                className="px-2 py-1 text-xs rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', borderColor: 'var(--color-text-secondary)' }}
              >
                <option value="low">Low</option>
                <option value="mid">Medium</option>
                <option value="high">High</option>
              </select>
            ) : (
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full 
                ${
                  todo.priority === "high"
                    ? "bg-red-200 text-red-800"
                    : todo.priority === "mid"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-green-200 text-green-800"
                }`}
              >
                {todo.priority}
              </span>
            )}

           <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
             {isEditing ? (
               <>
                 <button
                   onClick={handleUpdate}
                   className="px-3 py-2 text-sm text-white rounded-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full sm:w-auto" style={{ backgroundColor: 'var(--color-secondary)' }}
                   disabled={isUpdating}
                 >
                   {isUpdating ? (
                     <><FiSave className="inline-block animate-spin mr-1" /> Saving...</>
                   ) : (
                     <><FiSave className="inline-block" /> Save</>
                   )}
                 </button>
                 <button
                   onClick={handleCancel}
                   className="px-3 py-2 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full sm:w-auto"
                   disabled={isUpdating}
                 >
                   <><FiX className="inline-block" /> Cancel</>
                 </button>
               </>
             ) : (
               <>
                 <button
                   onClick={() => setIsEditing(true)}
                   className="px-3 py-2 text-sm text-white rounded-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full sm:w-auto" style={{ backgroundColor: 'var(--color-primary)' }}
                   disabled={isUpdating || isDeleting}
                 >
                    <><FiEdit className="inline-block" /> Edit</>
                 </button>
                 <button
                   onClick={handleDelete}
                   className="px-3 py-2 text-sm text-white rounded-md hover:brightness-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 w-full sm:w-auto" style={{ backgroundColor: 'var(--color-error)' }}
                   disabled={isDeleting || isUpdating}
                 >
                   {isDeleting ? (
                     <><FiTrash2 className="inline-block animate-spin mr-1" /> Deleting...</>
                   ) : (
                      <><FiTrash2 className="inline-block" /> Delete</>
                   )}
                 </button>
               </>
             )}
           </div>

           {isEditing ? (
             <input
               type="datetime-local"
               placeholder="Due Date"
               value={editedDueDate}
               onChange={(e) => setEditedDueDate(e.target.value)}
               className="px-2 py-1 text-xs rounded-md border focus:ring-2 focus:ring-blue-500 focus:border-blue-500" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)', borderColor: 'var(--color-text-secondary)' }}
             />
           ) : (
             todo.dueDate && (
               <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                 Due: {new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(todo.dueDate))}
               </span>
             ) 
           )}
           {todo.user && (
             <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
               created by: {todo.user.name}
             </span>
           )}

        </div>
      </div>

      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg z-10">
          <div className="flex flex-col items-center p-4">
            <FiAlertTriangle className="text-yellow-500 text-4xl mb-2" />
            <p className="text-sm font-semibold mb-3">Are you sure you want to delete this todo?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-xs text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Confirm'}
              </button>
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1 text-xs text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TodoCard;
