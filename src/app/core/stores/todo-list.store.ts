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

  /** Task Statistics */
  taskStatistics: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

const initialState: TTodoListState = {
  taskListing: [],
  isTaskEditingModalOpened: false,
  idOfTaskBeingEdited: null,
  loaded: false,
  frequencyIndex: 0,
  taskStatistics: {
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  },
};

export const TodoListStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    /** CREATE */
    addTodoTask(task: string, status: 'pending' | 'in-progress' | 'completed') {
      if (!task && !status) return false;

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
        frequencyIndex: frequency,
        taskStatistics: {
          total: store.taskListing().length + 1,
          pending:
            status === 'pending'
              ? store.taskStatistics().pending + 1
              : store.taskStatistics().pending,
          inProgress:
            status === 'in-progress'
              ? store.taskStatistics().inProgress + 1
              : store.taskStatistics().inProgress,
          completed:
            status === 'completed'
              ? store.taskStatistics().completed + 1
              : store.taskStatistics().completed,
        },
      });

      return true;
    },

    /** READ */
    getTaskOnFirstLoad() {
      if (store.loaded()) return;

      const initialTasks: TodoListDetail[] = [
        {
          id: crypto.randomUUID().split('-')[0].toUpperCase(),
          task: 'walk',
          status: 'pending',
          taskFrequency: 1,
        },
        {
          id: crypto.randomUUID().split('-')[0].toUpperCase(),
          task: 'read',
          status: 'in-progress',
          taskFrequency: 2,
        },
        {
          id: crypto.randomUUID().split('-')[0].toUpperCase(),
          task: 'cook',
          status: 'completed',
          taskFrequency: 3,
        },
      ];

      patchState(store, {
        taskListing: initialTasks,
        loaded: true,
        frequencyIndex: initialTasks.length,
        taskStatistics: {
          total: initialTasks.length,
          pending: initialTasks.filter((data) => data.status === 'pending').length,
          inProgress: initialTasks.filter((data) => data.status === 'in-progress').length,
          completed: initialTasks.filter((data) => data.status === 'completed').length,
        },
      });
    },

    /** UPDATE */
    saveEditedTask(
      task: string,
      status: 'pending' | 'in-progress' | 'completed',
      frequency: number,
    ) {
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
        taskStatistics: {
          total: store.taskListing().length,
          pending: store.taskListing().filter((data) => data.status === 'pending').length,
          inProgress: store.taskListing().filter((data) => data.status === 'in-progress').length,
          completed: store.taskListing().filter((data) => data.status === 'completed').length,
        },
      });
    },

    /** DELETE */
    deleteExistingTask(taskId: string, status: 'pending' | 'in-progress' | 'completed') {
      patchState(store, {
        taskListing: store.taskListing().filter((data) => data.id !== taskId),
        taskStatistics: {
          total: store.taskListing().length - 1,
          pending:
            status === 'pending'
              ? store.taskStatistics().pending - 1
              : store.taskStatistics().pending,
          inProgress:
            status === 'in-progress'
              ? store.taskStatistics().inProgress - 1
              : store.taskStatistics().inProgress,
          completed:
            status === 'completed'
              ? store.taskStatistics().completed - 1
              : store.taskStatistics().completed,
        },
      });
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
