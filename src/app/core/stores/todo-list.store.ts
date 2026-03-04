import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

interface TodoListDetail {
  id: string;
  task: string | null;
  taskFrequency: number;
  status: 'pending' | 'in-progress' | 'completed';
}

interface TTodoListState {
  taskListing: TodoListDetail[];
  isTaskEditingModalOpened: boolean;
  idOfTaskBeingEdited: string | null;
  loaded: boolean;
  frequencyIndex: number;
}

const initialState: TTodoListState = {
  taskListing: [],
  isTaskEditingModalOpened: false,
  idOfTaskBeingEdited: null,
  loaded: false,
  frequencyIndex: 0,
};

export const TodoListStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    /** CREATE */
    addTodoTask(task: string, status: "pending" | "in-progress" | "completed") {
      if (!task) return false;

      /** find the max frequency and add 1 to it */
      const frequency = Math.max(...store.taskListing().map((data) => data.taskFrequency)) + 1;

      const itemToAdd: TodoListDetail = {
        /** to shorten the UUID */
        id: crypto.randomUUID().split('-')[0].toUpperCase(),
        task: task,
        status: status,
        taskFrequency: frequency,
      };

      patchState(store, {
        taskListing: [...store.taskListing(), itemToAdd],
        frequencyIndex: frequency 
      });

      return true;
    },

    /** READ */
    getTaskOnFirstLoad() {
      if (store.loaded()) return;

      const initialTasks: TodoListDetail[] = [
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'walk', status: 'pending', taskFrequency: 1 },
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'read', status: 'in-progress', taskFrequency: 2 },
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'cook', status: 'completed', taskFrequency: 3 },
      ];

      patchState(store, {
        taskListing: initialTasks,
        loaded: true,
        frequencyIndex: initialTasks.length,
      });
    },

    /** UPDATE */
    saveEditedTask(task: string, status: "pending" | "in-progress" | "completed", frequency: number) {
      const updatedTasksList = store.taskListing().map((data) => {
        /** Check if the current item is the one being edited */
        if (data.id === store.idOfTaskBeingEdited()) {
          /** override with new values */
          return { ...data, task: task, status: status, taskFrequency: frequency };
        }
        return data;
      });

      patchState(store, {
        taskListing: updatedTasksList,
        isTaskEditingModalOpened: false,
        idOfTaskBeingEdited: null,
        frequencyIndex: frequency,
      });
    },

    /** DELETE */
    deleteExistingTask(taskId: string) {
      patchState(store, { taskListing: store.taskListing().filter((data) => data.id !== taskId) });
    },

    openTaskEditingModal(itemId: string) {
      patchState(store, {
        isTaskEditingModalOpened: true,
        idOfTaskBeingEdited: itemId,
      });
    },

    closeTaskEditingModal() {
      patchState(store, {
        isTaskEditingModalOpened: false,
        idOfTaskBeingEdited: null,
      });
    },
  })),

  withHooks({
    onInit(store) {
      store.getTaskOnFirstLoad();
    },
  }),
);

export const injectTodoListStore = () => inject(TodoListStore);
