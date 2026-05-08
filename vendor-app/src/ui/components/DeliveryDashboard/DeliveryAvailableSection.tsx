import { useState } from 'react';
import { FiTruck } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import DeliveryTaskCard from './DeliveryTaskCard';
import DeliveryTaskHandlingNotesSheet from './DeliveryTaskHandlingNotesSheet';
import DeliveryTaskLocationSheet from './DeliveryTaskLocationSheet';

interface DeliveryAvailableSectionProps {
  tasks: DeliveryPartnerTaskSummary[];
  isLoading: boolean;
  error: string;
  actionError: string;
  activeTaskId: string | null;
  onRetry: () => void;
  onAccept: (task: DeliveryPartnerTaskSummary) => void;
}

export default function DeliveryAvailableSection({
  tasks,
  isLoading,
  error,
  actionError,
  activeTaskId,
  onRetry,
  onAccept,
}: DeliveryAvailableSectionProps) {
  const [selectedLocationTask, setSelectedLocationTask] = useState<DeliveryPartnerTaskSummary | null>(
    null,
  );
  const [selectedNotesTask, setSelectedNotesTask] = useState<DeliveryPartnerTaskSummary | null>(
    null,
  );

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h2 className="text-lg font-bold text-base-content">Available Orders</h2>
          <p className="text-sm text-base-content/60">Pick one order and start delivery.</p>
        </div>

        {actionError ? (
          <div className="alert alert-error">
            <span>{actionError}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-dots loading-lg text-primary" />
          </div>
        ) : error ? (
          <div className="alert alert-error">
            <span>{error}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body items-center py-12 text-center">
              <FiTruck className="text-base-content/20" size={56} />
              <h3 className="font-semibold text-base-content/70">No orders now</h3>
              <p className="text-sm text-base-content/50">New orders will show here.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <DeliveryTaskCard
                key={task.taskId}
                task={task}
                actionLabel="Accept"
                isSubmitting={activeTaskId === task.taskId}
                onAction={onAccept}
                onLocationAction={setSelectedLocationTask}
                onNotesAction={task.handlingNotes ? setSelectedNotesTask : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <DeliveryTaskLocationSheet
        task={selectedLocationTask}
        onClose={() => setSelectedLocationTask(null)}
      />
      {selectedNotesTask ? (
        <DeliveryTaskHandlingNotesSheet
          task={selectedNotesTask}
          onClose={() => setSelectedNotesTask(null)}
        />
      ) : null}
    </>
  );
}
