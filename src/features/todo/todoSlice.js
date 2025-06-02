import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appwriteService, Query } from '../../lib/appwrite';

const initialState = {
    todos: [],
    status: 'idle', // 'idle', 'loading', 'succeeded', 'failed'
    error: null,
};

// Async thunks
export const fetchTodos = createAsyncThunk('todo/fetchTodos', async (userId = null) => {
    let queries = [];
    if (userId) {
        // Assuming 'userId' is the attribute name in Appwrite documents for the todo's owner
        queries.push(Query.equal('userId', userId));
    }
    // Add any other default queries here if needed (e.g., pagination, limits)

    const response = await appwriteService.getTodos(queries);
    return response;
});

export const createTodo = createAsyncThunk(
    'todo/createTodo',
    async (todoData) => {
        const response = await appwriteService.createTodo(todoData);
        return response;
    }
);

export const updateTodo = createAsyncThunk(
    'todo/updateTodo',
    async ({ id, ...todoData }) => {
        const response = await appwriteService.updateTodo(id, todoData);
        // Appwrite updateDocument does not return the updated document structure
        // We will handle the state update based on the payload in the reducer
        return { id, ...todoData };
    }
);

export const deleteTodo = createAsyncThunk(
    'todo/deleteTodo',
    async (id) => {
        await appwriteService.deleteTodo(id);
        return id; // Return the deleted todo ID
    }
);

const todoSlice = createSlice({
    name: 'todo',
    initialState,
    reducers: {
        // Reducers to handle local state updates if needed (e.g., optimistic updates)
        // For now, we rely on fetching after mutations
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodos.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchTodos.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.todos = action.payload;
            })
            .addCase(fetchTodos.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(createTodo.fulfilled, (state, action) => {
                // Appwrite createDocument returns the full document
                const newTodo = {
                     id: action.payload.$id,
                     title: action.payload.title,
                     description: action.payload.description,
                     priority: action.payload.priority,
                     completed: action.payload.completed,
                     dueDate: action.payload.dueDate,
                     createdAt: action.payload.$createdAt,
                     user: {
                         id: action.payload.userId,
                         name: action.payload.userName
                     }
                }
                state.todos.push(newTodo);
            })
            .addCase(updateTodo.fulfilled, (state, action) => {
                const index = state.todos.findIndex(
                    (todo) => todo.id === action.payload.id
                );
                if (index !== -1) {
                    state.todos[index] = { ...state.todos[index], ...action.payload };
                }
            })
            .addCase(deleteTodo.fulfilled, (state, action) => {
                state.todos = state.todos.filter(todo => todo.id !== action.payload);
            });
    },
});

// export const { addTodo } = todoSlice.actions;
export default todoSlice.reducer;