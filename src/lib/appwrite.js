import { Client, Account, Databases, Query, ID } from 'appwrite';
import conf from '../conf/conf';

export const client = new Client();

client
    .setEndpoint(conf.appwriteEndpoint) // Replace with your Appwrite endpoint
    .setProject(conf.appwriteProjectId); // Replace with your project ID

export const account = new Account(client);
const databases = new Databases(client);

class AppwriteService {
    async createTodo({ title, description, priority, completed, dueDate, user }) {
        try {
            const todo = await databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                'unique()', // Use unique() for document ID
                {
                    title,
                    description,
                    priority,
                    completed,
                    dueDate,
                    createdAt: new Date().toISOString(),
                    userId: user.id, // Store user ID
                    userName: user.name // Store user name
                }
            );
            return todo;
        } catch (error) {
            console.error("Appwrite service :: createTodo :: error", error);
            throw error;
        }
    }

    async getTodos(queries = []) {
        try {
            const todos = await databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                queries
            );
            // Map the response to match your existing todo structure
            return todos.documents.map(doc => ({
                id: doc.$id,
                title: doc.title,
                description: doc.description,
                priority: doc.priority,
                completed: doc.completed,
                dueDate: doc.dueDate,
                createdAt: doc.$createdAt,
                user: { // Reconstruct user object
                    id: doc.userId,
                    name: doc.userName
                }
            }));
        } catch (error) {
            console.error("Appwrite service :: getTodos :: error", error);
            throw error;
        }
    }

    async updateTodo(id, { title, description, priority, completed, dueDate }) {
        try {
            const todo = await databases.updateDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                id,
                {
                    title,
                    description,
                    priority,
                    completed,
                    dueDate,
                }
            );
            return todo;
        } catch (error) {
            console.error("Appwrite service :: updateTodo :: error", error);
            throw error;
        }
    }

    async deleteTodo(id) {
        try {
            await databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                id
            );
            return true; // Indicate success
        } catch (error) {
            console.error("Appwrite service :: deleteTodo :: error", error);
            throw error;
        }
    }
}

const appwriteService = new AppwriteService();
export { appwriteService, ID, Query }; // Export appwriteService, ID, and Query
