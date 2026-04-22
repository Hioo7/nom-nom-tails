import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDeliveryPartnerTasks } from '../../../hooks/useDeliveryPartnerTasks';
import { useDeliveryTaskActions } from '../../../hooks/useDeliveryTaskActions';
import { getErrorMessage } from '../AdminDashboard/orderFormatters';
import DeliveryCaptureView from './DeliveryCaptureView';
import { buildDeliveryDashboardPath, readDeliveryProofTaskFromState } from './deliveryNavigation';

export default function DeliveryProofScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams<{ taskId: string }>();
  const [submitError, setSubmitError] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const tasks = useDeliveryPartnerTasks();
  const { completeTask } = useDeliveryTaskActions();

  const routeTask = readDeliveryProofTaskFromState(location.state);
  const task = useMemo(() => {
    if (routeTask && routeTask.taskId === taskId) {
      return routeTask;
    }

    return tasks.myTasks.find((item) => item.taskId === taskId) ?? null;
  }, [routeTask, taskId, tasks.myTasks]);

  const handleBack = () => {
    navigate(buildDeliveryDashboardPath({ tab: 'orders', section: 'tasks' }), {
      replace: true,
    });
  };

  const handleConfirm = async (confirmedTaskId: string, file: File): Promise<void> => {
    setSubmitError('');
    setActiveTaskId(confirmedTaskId);

    try {
      await completeTask(confirmedTaskId, file);
      navigate(
        buildDeliveryDashboardPath({
          tab: 'orders',
          section: 'tasks',
          refreshToken: `${Date.now()}`,
        }),
        { replace: true },
      );
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not mark this delivery.'));
    } finally {
      setActiveTaskId(null);
    }
  };

  return (
    <DeliveryCaptureView
      task={task}
      isLoadingTask={tasks.isLoading && task === null}
      taskError={task === null ? tasks.error : ''}
      isSubmitting={task !== null && activeTaskId === task.taskId}
      error={submitError}
      onBack={handleBack}
      onConfirm={handleConfirm}
    />
  );
}
