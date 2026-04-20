import { useState } from 'react';
import { useDeliveryPartnerTasks } from '../../../hooks/useDeliveryPartnerTasks';
import { useDeliveryTaskActions } from '../../../hooks/useDeliveryTaskActions';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import { getErrorMessage } from '../AdminDashboard/orderFormatters';
import DeliveryAvailableSection from './DeliveryAvailableSection';
import DeliveryCaptureView from './DeliveryCaptureView';
import DeliveryOrdersPills, { type DeliveryOrdersSection } from './DeliveryOrdersPills';
import DeliveryTasksSection from './DeliveryTasksSection';

export default function DeliveryOrdersTab() {
  const [activeSection, setActiveSection] = useState<DeliveryOrdersSection>('available');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<DeliveryPartnerTaskSummary | null>(null);
  const [listActionError, setListActionError] = useState('');
  const [captureError, setCaptureError] = useState('');
  const tasks = useDeliveryPartnerTasks();
  const { acceptTask, completeTask } = useDeliveryTaskActions();

  const handleAccept = async (task: DeliveryPartnerTaskSummary): Promise<void> => {
    setListActionError('');
    setActiveTaskId(task.taskId);

    try {
      await acceptTask(task.taskId);
      setActiveSection('tasks');
      tasks.refetch();
    } catch (error) {
      setListActionError(getErrorMessage(error, 'Could not accept this order.'));
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleComplete = async (taskId: string, file: File): Promise<void> => {
    setCaptureError('');
    setActiveTaskId(taskId);

    try {
      await completeTask(taskId, file);
      setSelectedTask(null);
      tasks.refetch();
    } catch (error) {
      setCaptureError(getErrorMessage(error, 'Could not mark this delivery.'));
    } finally {
      setActiveTaskId(null);
    }
  };

  if (selectedTask) {
    return (
      <DeliveryCaptureView
        task={selectedTask}
        isSubmitting={activeTaskId === selectedTask.taskId}
        error={captureError}
        onBack={() => {
          setCaptureError('');
          setSelectedTask(null);
        }}
        onConfirm={handleComplete}
      />
    );
  }

  return (
    <div>
      <DeliveryOrdersPills activeSection={activeSection} onSectionChange={setActiveSection} />

      {activeSection === 'available' ? (
        <DeliveryAvailableSection
          tasks={tasks.availableTasks}
          isLoading={tasks.isLoading}
          error={tasks.error}
          actionError={listActionError}
          activeTaskId={activeTaskId}
          onRetry={tasks.refetch}
          onAccept={(task) => {
            void handleAccept(task);
          }}
        />
      ) : (
        <DeliveryTasksSection
          tasks={tasks.myTasks}
          isLoading={tasks.isLoading}
          error={tasks.error}
          actionError={listActionError}
          activeTaskId={activeTaskId}
          onRetry={tasks.refetch}
          onDeliver={(task) => {
            setCaptureError('');
            setSelectedTask(task);
          }}
        />
      )}
    </div>
  );
}
