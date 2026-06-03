export class Task {
id: string;
title: string;
status: 'todo' | 'in-progress' | 'done';
dueDate?: string;
createdAt: Date;
updatedAt: Date;
}