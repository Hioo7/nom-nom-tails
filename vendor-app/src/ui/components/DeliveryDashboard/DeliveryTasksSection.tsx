import { useState } from 'react';
import { FiCheck, FiCheckCircle, FiX } from 'react-icons/fi';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import DeliveryTaskCard from './DeliveryTaskCard';
import DeliveryTaskFailureSheet from './DeliveryTaskFailureSheet';
import DeliveryTaskLocationSheet from './DeliveryTaskLocationSheet';

interface DeliveryTasksSectionProps {
  tasks: DeliveryPartnerTaskSummary[];
  isLoading: boolean;
  error: string;
  actionError: string;
  activeTaskId: string | null;
  onRetry: () => void;
  onDeliver: (task: DeliveryPartnerTaskSummary) => void;
  onFail: (task: DeliveryPartnerTaskSummary, failureReason: string) => Promise<void>;
  onCall: (task: DeliveryPartnerTaskSummary) => void;
}

export default function DeliveryTasksSection({
  tasks,
  isLoading,
  error,
  actionError,
  activeTaskId,
  onRetry,
  onDeliver,
  onFail,
  onCall,
}: DeliveryTasksSectionProps) {
  const [selectedLocationTask, setSelectedLocationTask] = useState<DeliveryPartnerTaskSummary | null>(
    null,
  );
  const [selectedFailureTask, setSelectedFailureTask] = useState<DeliveryPartnerTaskSummary | null>(
    null,
  );

  return (
    <>
      <div className="flex flex-col gap-4 p-4">
        <div>
          <h2 className="text-lg font-bold text-base-content">My Tasks</h2>
          <p className="text-sm text-base-content/60">Finish these orders and mark done.</p>
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
              <FiCheckCircle className="text-base-content/20" size={56} />
              <h3 className="font-semibold text-base-content/70">No tasks now</h3>
              <p className="text-sm text-base-content/50">Accepted orders will show here.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <DeliveryTaskCard
                key={task.taskId}
                task={task}
                actionLabel="Mark delivered"
                actionIcon={<FiCheck size={18} />}
                actionAriaLabel={`Mark order ${task.orderNumber} as delivered`}
                actionButtonClassName="btn-success"
                hideActionLabel
                isSubmitting={false}
                onAction={onDeliver}
                onLocationAction={setSelectedLocationTask}
                onCallAction={onCall}
                secondaryAction={{
                  ariaLabel: `Mark order ${task.orderNumber} as failed`,
                  icon: <FiX size={18} />,
                  isSubmitting: activeTaskId === task.taskId,
                  onAction: setSelectedFailureTask,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <DeliveryTaskLocationSheet
        task={selectedLocationTask}
        onClose={() => setSelectedLocationTask(null)}
      />
      {selectedFailureTask ? (
        <DeliveryTaskFailureSheet
          key={selectedFailureTask.taskId}
          task={selectedFailureTask}
          isSubmitting={activeTaskId === selectedFailureTask.taskId}
          error={actionError}
          onClose={() => setSelectedFailureTask(null)}
          onConfirm={onFail}
        />
      ) : null}
    </>
  );
}
