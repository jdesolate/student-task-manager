import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Task, CreateTaskData, UpdateTaskData } from '@/types';

const TASKS_COLLECTION = 'tasks';

// Convert Firestore document to Task object
const convertToTask = (doc: DocumentData): Task => {
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate.toDate(),
    attachmentUrl: data.attachmentUrl,
    attachmentName: data.attachmentName,
    userId: data.userId,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  };
};

// Upload file to Firebase Storage
export const uploadFile = async (file: File, userId: string, taskId: string): Promise<string> => {
  const storageRef = ref(storage, `tasks/${userId}/${taskId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Delete file from Firebase Storage
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Create a new task
export const createTask = async (userId: string, taskData: CreateTaskData): Promise<Task> => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    title: taskData.title,
    description: taskData.description,
    status: taskData.status,
    priority: taskData.priority,
    dueDate: Timestamp.fromDate(taskData.dueDate),
    userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  let attachmentUrl = '';
  let attachmentName = '';

  // Upload attachment if provided
  if (taskData.attachment) {
    attachmentUrl = await uploadFile(taskData.attachment, userId, docRef.id);
    attachmentName = taskData.attachment.name;

    // Update document with attachment info
    await updateDoc(docRef, {
      attachmentUrl,
      attachmentName,
    });
  }

  const docSnap = await getDoc(docRef);
  return convertToTask(docSnap);
};

// Get all tasks for a user
export const getTasks = async (userId: string): Promise<Task[]> => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertToTask);
};

// Get a single task
export const getTask = async (taskId: string): Promise<Task | null> => {
  const docRef = doc(db, TASKS_COLLECTION, taskId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertToTask(docSnap);
  }
  return null;
};

// Update a task
export const updateTask = async (taskData: UpdateTaskData): Promise<void> => {
  const { id, attachment, ...updateData } = taskData;
  const docRef = doc(db, TASKS_COLLECTION, id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatePayload: any = {
    ...updateData,
    updatedAt: Timestamp.now(),
  };

  if (updateData.dueDate) {
    updatePayload.dueDate = Timestamp.fromDate(updateData.dueDate);
  }

  // Handle new attachment
  if (attachment) {
    // Get current task to delete old attachment
    const currentTask = await getTask(id);
    if (currentTask?.attachmentUrl) {
      await deleteFile(currentTask.attachmentUrl);
    }

    // Upload new attachment
    const attachmentUrl = await uploadFile(attachment, currentTask!.userId, id);
    updatePayload.attachmentUrl = attachmentUrl;
    updatePayload.attachmentName = attachment.name;
  }

  await updateDoc(docRef, updatePayload);
};

// Delete a task
export const deleteTask = async (taskId: string): Promise<void> => {
  // Get task to delete attachment
  const task = await getTask(taskId);
  if (task?.attachmentUrl) {
    await deleteFile(task.attachmentUrl);
  }

  const docRef = doc(db, TASKS_COLLECTION, taskId);
  await deleteDoc(docRef);
};

// Listen to real-time updates for user's tasks
export const subscribeToTasks = (
  userId: string,
  callback: (tasks: Task[]) => void
): (() => void) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot) => {
    const tasks = snapshot.docs.map(convertToTask);
    callback(tasks);
  });
};
