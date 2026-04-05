import { Modal } from '../shared/Modal';
import { HabitForm } from './HabitForm';
import { useStore, useToast } from '../../context/StoreContext';
import type { Habit } from '../../types';

interface Props {
  onClose: () => void;
}

export function AddHabitModal({ onClose }: Props) {
  const { dispatch } = useStore();
  const { showToast } = useToast();

  function handleSubmit(habit: Habit) {
    dispatch({ type: 'ADD_HABIT', habit });
    showToast(`"${habit.name}" added!`);
    onClose();
  }

  return (
    <Modal title="New Habit" onClose={onClose}>
      <HabitForm onSubmit={handleSubmit} onCancel={onClose} />
    </Modal>
  );
}
