import { Routes } from '@angular/router';
import { TodoListStore } from './core/stores';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'todo-list' },
  {
    path: 'todo-list',
    loadComponent: () =>
      import('./core/components/todo-list/todo-list').then((m) => m.TodoList),
    providers: [TodoListStore],
  },
  { path: '**', redirectTo: 'todo-list' },
];
