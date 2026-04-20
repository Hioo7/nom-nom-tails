import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useTimeSlotActions } from '../../../hooks/useTimeSlotActions';
import { useTimeSlots } from '../../../hooks/useTimeSlots';
import type { DayOfWeek, TimeSlot, UpdateTimeSlotPayload } from '../../../types';
import CreateEditTimeSlotModal from './CreateEditTimeSlotModal';
import DeleteTimeSlotModal from './DeleteTimeSlotModal';
import { formatDay } from './orderFormatters';
import TimeSlotDayBar from './TimeSlotDayBar';
import TimeSlotList from './TimeSlotList';

const DAY_MAP: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

type ModalMode = 'create' | 'edit' | 'delete' | null;

export default function TimeSlotsSection() {
  const [activeDay, setActiveDay] = useState<DayOfWeek>(DAY_MAP[new Date().getDay()]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [activeModal, setActiveModal] = useState<ModalMode>(null);

  const { slots, isLoading, error, refetch } = useTimeSlots(activeDay);
  const { createTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimeSlotActions(refetch);
  const activeDayLabel = formatDay(activeDay);

  const openCreate = () => {
    setSelectedSlot(null);
    setActiveModal('create');
  };

  const openEdit = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setActiveModal('edit');
  };

  const openDelete = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setActiveModal('delete');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedSlot(null);
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-base-content">Time Slots</h2>
            <span className="badge badge-neutral badge-sm">{slots.length} total</span>
          </div>
          <p className="text-sm text-base-content/60">
            Manage the delivery windows for {activeDayLabel} with a mobile-friendly workflow.
          </p>
        </div>
        <button type="button" className="btn btn-sm btn-neutral sm:self-center" onClick={openCreate}>
          <FiPlus size={16} />
          New slot
        </button>
      </div>

      <TimeSlotDayBar activeDay={activeDay} onDayChange={setActiveDay} />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-dots loading-lg text-primary" />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={refetch}>
            Retry
          </button>
        </div>
      ) : (
        <TimeSlotList
          dayLabel={activeDayLabel}
          slots={slots}
          onEdit={openEdit}
          onDelete={openDelete}
          onAddFirst={openCreate}
        />
      )}

      {activeModal === 'create' ? (
        <CreateEditTimeSlotModal
          mode="create"
          day={activeDay}
          onClose={closeModal}
          onSaved={createTimeSlot}
        />
      ) : null}

      {activeModal === 'edit' && selectedSlot ? (
        <CreateEditTimeSlotModal
          mode="edit"
          slot={selectedSlot}
          day={activeDay}
          onClose={closeModal}
          onSaved={(payload: UpdateTimeSlotPayload) => updateTimeSlot(selectedSlot.id, payload)}
        />
      ) : null}

      {activeModal === 'delete' && selectedSlot ? (
        <DeleteTimeSlotModal
          slot={selectedSlot}
          onConfirm={() => deleteTimeSlot(selectedSlot.id)}
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}
