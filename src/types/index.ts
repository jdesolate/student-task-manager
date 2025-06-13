export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  attachmentUrl?: string;
  attachmentName?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  status: Task['status'];
  priority: Task['priority'];
  dueDate: Date;
  attachment?: File;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}
