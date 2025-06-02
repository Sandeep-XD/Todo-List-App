const conf ={
    clerkPublishableKey: String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "default"),
    appwriteEndpoint: String(import.meta.env.VITE_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID || "default"),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID || "default"),
    appwriteCollectionId: String(import.meta.env.VITE_APPWRITE_COLLECTION_ID || "default"),
}
export default conf;