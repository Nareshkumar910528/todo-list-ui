import { inject } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';

interface TodoListDetail {
  id: string;
  task: string | null;
  taskFrequency: number;
}

interface TTodoListState {
  taskListing: TodoListDetail[];
  isTaskEditingModalOpened: boolean;
  idOfTaskBeingEdited: string | null;
  loaded: boolean;
}

const initialState: TTodoListState = {
  taskListing: [],
  isTaskEditingModalOpened: false,
  idOfTaskBeingEdited: null,
  loaded: false,
};

export const TodoListStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    /** CREATE */
    addTodoTask(task: string) {
      if (!task) return false;

      const frequency = store.taskListing().length + 1;

      const itemToAdd: TodoListDetail = {
        /** to shorten the UUID */
        id: crypto.randomUUID().split('-')[0].toUpperCase(),
        task: task,
        taskFrequency: frequency,
      };
      patchState(store, {
        taskListing: [...store.taskListing(), itemToAdd],
      });
      return true;
    },

    /** READ */
    getTaskOnFirstLoad() {
      if (store.loaded()) return;

      const initialTasks: TodoListDetail[] = [
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'walk', taskFrequency: 1 },
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'read', taskFrequency: 2 },
        { id: crypto.randomUUID().split('-')[0].toUpperCase(), task: 'cook', taskFrequency: 3 },
      ];

      patchState(store, {
        taskListing: initialTasks,
        loaded: true,
      });
    },

    /** UPDATE */
    saveEditedTask(task: string, frequency: number) {
      const updatedTasksList = store.taskListing().map((data) => {
        /** Check if the current item is the one being edited */
        if (data.id === store.idOfTaskBeingEdited()) {
          /** override with new values */
          return { ...data, task: task, taskFrequency: frequency };
        }
        return data;
      });

      patchState(store, {
        taskListing: updatedTasksList,
        isTaskEditingModalOpened: false,
        idOfTaskBeingEdited: null,
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
