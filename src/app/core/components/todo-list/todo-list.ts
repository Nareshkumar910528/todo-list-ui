import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { injectTodoListStore } from '../../stores';

@Component({
  selector: 'app-todo-list',
  imports: [ReactiveFormsModule],
  templateUrl: './todo-list.html',
  styleUrl: './todo-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoList {
  readonly todoListStore = injectTodoListStore();

  /** handle adding new task form control */
  addTaskForm = new FormGroup({
    task: new FormControl<string>('', {
      /** nonNullable --> when reset, it goes to the initial value, instead of null.
       * It avoids the null value.
       */
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  /** handle editing current task form control */
  editTaskForm = new FormGroup({
    task: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    frequency: new FormControl<number>(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
  });

  constructor() {
    /** set the current task details in the edit form when the edit modal is opened */
    effect(() => {
      const taskId = this.todoListStore.idOfTaskBeingEdited();

      if (taskId) {
        const taskDetails = this.todoListStore.taskListing().find((data) => data.id === taskId);

        /** setValue includes all the controls */
        /** patchValue includes only partial controls */
        if (taskDetails) {
          this.editTaskForm.patchValue({
            task: taskDetails.task ?? '',
            frequency: taskDetails.taskFrequency ?? 0,
          });
        }
      }
    });
  }

  onAddNewTask() {
    if (this.addTaskForm.invalid) return;

    const taskValue = this.addTaskForm.controls.task.value;

    if (taskValue) {
      const isTaskAdded = this.todoListStore.addTodoTask(taskValue);

      if (isTaskAdded) {
        this.addTaskForm.reset({ task: '' });
      }
    }
  }

  onEditCurrentTask(taskId: string) {
    this.todoListStore.openTaskEditingModal(taskId);
  }

  onDropTaskEditing() {
    this.todoListStore.closeTaskEditingModal();
  }

  onSaveEditedTask() {
    if (!this.editTaskForm.valid) return;

    const task = this.editTaskForm.controls.task.value;
    const frequency = this.editTaskForm.controls.frequency.value;

    this.todoListStore.saveEditedTask(task, frequency);
  }

  onDeleteTask(taskId: string) {
    this.todoListStore.deleteExistingTask(taskId);
  }

  onInteractOutsideOfModal() {
    this.todoListStore.closeTaskEditingModal();
  }
}
