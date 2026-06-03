import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(dto: CreateTaskDto): Task {
    const now = new Date();
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      status: dto.status ?? 'todo',
      dueDate: dto.dueDate,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks = [...this.tasks, task];
    return task;
  }

  findAll(): Task[] {
    return [...this.tasks];
  }

  findOne(id: string): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const current = this.findOne(id);
    const updated: Task = {
      ...current,
      ...dto,
      updatedAt: new Date(),
    };
    this.tasks = this.tasks.map((t) => (t.id === id ? updated : t));
    return updated;
  }

  remove(id: string): void {
    const before = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length === before) {
      throw new NotFoundException(`Task ${id} not found`);
    }
  }
}