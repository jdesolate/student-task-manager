'use client';
import { Task } from '@/types';
import { format } from 'date-fns'; 

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, status: Task['status']) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h3>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${getStatusColor(task.status)}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {isOverdue && (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Overdue
          </span>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
        <span>Due: {format(task.dueDate, 'MMM dd, yyyy')}</span>
        {task.attachmentUrl && (
          <a
            href={task.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-500 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attachment
          </a>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Created: {format(task.createdAt, 'MMM dd, yyyy')}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-red-600 hover:text-red-500 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
