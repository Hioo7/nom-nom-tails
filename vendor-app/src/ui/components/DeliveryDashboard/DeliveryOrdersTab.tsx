import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveryPartnerTasks } from '../../../hooks/useDeliveryPartnerTasks';
import { useDeliveryTaskActions } from '../../../hooks/useDeliveryTaskActions';
import type { DeliveryPartnerTaskSummary } from '../../../types';
import { getErrorMessage } from '../AdminDashboard/orderFormatters';
import DeliveryAvailableSection from './DeliveryAvailableSection';
import DeliveryOrdersPills from './DeliveryOrdersPills';
import { openTaskDialer } from './deliveryTaskCall';
import DeliveryTasksSection from './DeliveryTasksSection';
import { getDeliveryProofPath, type DeliveryOrdersSection } from './deliveryNavigation';

interface DeliveryOrdersTabProps {
  activeSection: DeliveryOrdersSection;
  refreshToken: string;
  onSectionChange: (section: DeliveryOrdersSection) => void;
  onRefreshHandled: () => void;
}

export default function DeliveryOrdersTab({
  activeSection,
  refreshToken,
  onSectionChange,
  onRefreshHandled,
}: DeliveryOrdersTabProps) {
  const navigate = useNavigate();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [listActionError, setListActionError] = useState('');
  const tasks = useDeliveryPartnerTasks();
  const { acceptTask, failTask } = useDeliveryTaskActions();
  const { refetch } = tasks;

  useEffect(() => {
    if (!refreshToken) {
      return;
    }

    refetch();
    onRefreshHandled();
  }, [onRefreshHandled, refreshToken, refetch]);

  const handleAccept = async (task: DeliveryPartnerTaskSummary): Promise<void> => {
    setListActionError('');
    setActiveTaskId(task.taskId);

    try {
      await acceptTask(task.taskId);
      onSectionChange('tasks');
      refetch();
    } catch (error) {
      setListActionError(getErrorMessage(error, 'Could not accept this order.'));
    } finally {
      setActiveTaskId(null);
    }
  };

  const handleFail = async (
    task: DeliveryPartnerTaskSummary,
    failureReason: string,
  ): Promise<void> => {
    setListActionError('');
    setActiveTaskId(task.taskId);

    try {
      await failTask(task.taskId, failureReason);
      refetch();
    } catch (error) {
      setListActionError(getErrorMessage(error, 'Could not mark this delivery as failed.'));
      throw error;
    } finally {
      setActiveTaskId(null);
    }
  };

  return (
    <div>
      <DeliveryOrdersPills activeSection={activeSection} onSectionChange={onSectionChange} />

      {activeSection === 'available' ? (
        <DeliveryAvailableSection
          title="Available Orders"
          subtitle="Pick one order and start delivery."
          tasks={tasks.availableTasks}
          isLoading={tasks.isLoading}
          error={tasks.error}
          actionError={listActionError}
          activeTaskId={activeTaskId}
          onRetry={refetch}
          onAccept={(task) => {
            void handleAccept(task);
          }}
        />
      ) : activeSection === 'all' ? (
        <DeliveryAvailableSection
          title="All Orders"
          subtitle="All pending deliveries across all dates."
          tasks={tasks.allAvailableTasks}
          isLoading={tasks.isLoading}
          error={tasks.error}
          actionError={listActionError}
          activeTaskId={activeTaskId}
          onRetry={refetch}
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
          onRetry={refetch}
          onDeliver={(task) => {
            navigate(getDeliveryProofPath(task.taskId), { state: { task } });
          }}
          onFail={handleFail}
          onCall={(task) => openTaskDialer(task.customerPhone)}
        />
      )}
    </div>
  );
}
