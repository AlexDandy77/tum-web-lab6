import { Modal } from '../shared/Modal';
import { HabitForm } from './HabitForm';
import { useStore, useToast } from '../../context/StoreContext';
import type { Habit } from '../../types';

interface Props {
  habit: Habit;
  onClose: () => void;
}

export function EditHabitModal({ habit, onClose }: Props) {
  const { dispatch } = useStore();
  const { showToast } = useToast();

  function handleSubmit(updated: Habit) {
    dispatch({ type: 'UPDATE_HABIT', habit: updated });
    showToast(`"${updated.name}" updated!`, 'info');
    onClose();
  }

  return (
    <Modal title="Edit Habit" onClose={onClose}>
      <HabitForm onSubmit={handleSubmit} onCancel={onClose} initial={habit} />
    </Modal>
  );
}
