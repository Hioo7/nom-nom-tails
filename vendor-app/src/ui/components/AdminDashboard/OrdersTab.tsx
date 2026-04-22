import { useState } from 'react';
import type {
  IngredientOption,
  PendingSettlementOrder,
  RecordSettlementPaymentPayload,
} from '../../../types';
import useIngredients from '../../../hooks/useIngredients';
import { useIngredientActions } from '../../../hooks/useIngredientActions';
import { useOrderActions } from '../../../hooks/useOrderActions';
import { usePendingSettlements } from '../../../hooks/usePendingSettlements';
import { useUpcomingOrders } from '../../../hooks/useUpcomingOrders';
import CreateIngredientModal from './CreateIngredientModal';
import EditIngredientModal from './EditIngredientModal';
import IngredientStockModal from './IngredientStockModal';
import IngredientsSection from './IngredientsSection';
import OrderDetailsModal from './OrderDetailsModal';
import OrdersPills, { type OrdersSection } from './OrdersPills';
import ProcurementModal from './ProcurementModal';
import RecordSettlementModal from './RecordSettlementModal';
import SettlementsSection from './SettlementsSection';
import UpcomingOrdersSection from './UpcomingOrdersSection';
import { getErrorMessage } from './orderFormatters';

export default function OrdersTab() {
  const [activeSection, setActiveSection] = useState<OrdersSection>('upcoming');
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [isProcurementOpen, setIsProcurementOpen] = useState(false);
  const [isCreateIngredientOpen, setIsCreateIngredientOpen] = useState(false);
  const [selectedSettlement, setSelectedSettlement] = useState<PendingSettlementOrder | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<IngredientOption | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<IngredientOption | null>(null);
  const [ingredientModalAction, setIngredientModalAction] = useState<'add' | 'remove' | null>(null);
  const [fulfillingOrderId, setFulfillingOrderId] = useState<string | null>(null);
  const [approvingOrderId, setApprovingOrderId] = useState<string | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isAdjustingIngredient, setIsAdjustingIngredient] = useState(false);
  const [upcomingActionError, setUpcomingActionError] = useState('');
  const [settlementActionError, setSettlementActionError] = useState('');
  const [ingredientActionError, setIngredientActionError] = useState('');

  const upcomingOrders = useUpcomingOrders();
  const pendingSettlements = usePendingSettlements();
  const ingredientsInventory = useIngredients();
  const { approveOrder, rejectOrder, fulfillOrder, recordSettlementPayment } = useOrderActions({
    onUpcomingChanged: upcomingOrders.refetch,
    onSettlementsChanged: pendingSettlements.refetch,
  });
  const { increaseStock, decreaseStock } = useIngredientActions();

  async function handleFulfill(orderId: string): Promise<void> {
    setUpcomingActionError('');
    setFulfillingOrderId(orderId);

    try {
      await fulfillOrder(orderId);
    } catch (error) {
      setUpcomingActionError(
        getErrorMessage(error, 'Failed to mark the order as fulfilled.'),
      );
    } finally {
      setFulfillingOrderId(null);
    }
  }

  async function handleApprove(orderId: string): Promise<void> {
    setUpcomingActionError('');
    setApprovingOrderId(orderId);

    try {
      await approveOrder(orderId);
    } catch (error) {
      setUpcomingActionError(getErrorMessage(error, 'Failed to accept the order.'));
    } finally {
      setApprovingOrderId(null);
    }
  }

  async function handleReject(orderId: string): Promise<void> {
    setUpcomingActionError('');
    setRejectingOrderId(orderId);

    try {
      await rejectOrder(orderId);
    } catch (error) {
      setUpcomingActionError(getErrorMessage(error, 'Failed to reject the order.'));
    } finally {
      setRejectingOrderId(null);
    }
  }

  async function handleRecordPayment(
    payload: RecordSettlementPaymentPayload,
  ): Promise<void> {
    if (!selectedSettlement) {
      return;
    }

    setSettlementActionError('');
    setIsRecordingPayment(true);

    try {
      await recordSettlementPayment(selectedSettlement.orderId, payload);
      setSelectedSettlement(null);
    } catch (error) {
      setSettlementActionError(
        getErrorMessage(error, 'Failed to record settlement payment.'),
      );
    } finally {
      setIsRecordingPayment(false);
    }
  }

  async function handleIngredientAdjust(quantity: number): Promise<void> {
    if (!selectedIngredient || !ingredientModalAction) {
      return;
    }

    setIngredientActionError('');
    setIsAdjustingIngredient(true);

    try {
      if (ingredientModalAction === 'add') {
        await increaseStock(selectedIngredient.id, quantity);
      } else {
        await decreaseStock(selectedIngredient.id, quantity);
      }

      ingredientsInventory.refetch();
      setSelectedIngredient(null);
      setIngredientModalAction(null);
    } catch (error) {
      setIngredientActionError(getErrorMessage(error, 'Failed to update ingredient stock.'));
    } finally {
      setIsAdjustingIngredient(false);
    }
  }

  return (
    <div>
      <OrdersPills activeSection={activeSection} onSectionChange={setActiveSection} />

      {activeSection === 'upcoming' ? (
        <UpcomingOrdersSection
          orders={upcomingOrders.orders}
          isLoading={upcomingOrders.isLoading}
          error={upcomingOrders.error}
          actionError={upcomingActionError}
          fulfillingOrderId={fulfillingOrderId}
          approvingOrderId={approvingOrderId}
          rejectingOrderId={rejectingOrderId}
          onRetry={upcomingOrders.refetch}
          onViewDetails={setDetailOrderId}
          onOpenProcurement={() => setIsProcurementOpen(true)}
          onFulfill={(orderId) => {
            void handleFulfill(orderId);
          }}
          onApprove={(orderId) => {
            void handleApprove(orderId);
          }}
          onReject={(orderId) => {
            void handleReject(orderId);
          }}
        />
      ) : activeSection === 'settlements' ? (
        <SettlementsSection
          settlements={pendingSettlements.settlements}
          isLoading={pendingSettlements.isLoading}
          error={pendingSettlements.error}
          actionError={settlementActionError}
          onRetry={pendingSettlements.refetch}
          onRecordPayment={(settlement) => {
            setSettlementActionError('');
            setSelectedSettlement(settlement);
          }}
        />
      ) : (
        <IngredientsSection
          ingredients={ingredientsInventory.ingredients}
          isLoading={ingredientsInventory.isLoading}
          error={ingredientsInventory.error}
          actionError={ingredientActionError}
          activeIngredientId={
            isAdjustingIngredient && selectedIngredient ? selectedIngredient.id : null
          }
          onRetry={ingredientsInventory.refetch}
          onCreate={() => setIsCreateIngredientOpen(true)}
          onEdit={(ingredient) => {
            setEditingIngredient(ingredient);
          }}
          onAdd={(ingredient) => {
            setIngredientActionError('');
            setSelectedIngredient(ingredient);
            setIngredientModalAction('add');
          }}
          onRemove={(ingredient) => {
            setIngredientActionError('');
            setSelectedIngredient(ingredient);
            setIngredientModalAction('remove');
          }}
        />
      )}

      {detailOrderId ? (
        <OrderDetailsModal orderId={detailOrderId} onClose={() => setDetailOrderId(null)} />
      ) : null}

      {isProcurementOpen ? (
        <ProcurementModal onClose={() => setIsProcurementOpen(false)} />
      ) : null}

      {isCreateIngredientOpen ? (
        <CreateIngredientModal
          onClose={() => setIsCreateIngredientOpen(false)}
          onCreated={() => {
            ingredientsInventory.refetch();
          }}
        />
      ) : null}

      {editingIngredient ? (
        <EditIngredientModal
          ingredient={editingIngredient}
          onClose={() => setEditingIngredient(null)}
          onSaved={() => {
            ingredientsInventory.refetch();
          }}
        />
      ) : null}

      {selectedSettlement ? (
        <RecordSettlementModal
          settlement={selectedSettlement}
          isSubmitting={isRecordingPayment}
          errorMessage={settlementActionError}
          onClose={() => {
            if (!isRecordingPayment) {
              setSettlementActionError('');
              setSelectedSettlement(null);
            }
          }}
          onSave={handleRecordPayment}
        />
      ) : null}

      {selectedIngredient && ingredientModalAction ? (
        <IngredientStockModal
          ingredient={selectedIngredient}
          action={ingredientModalAction}
          isSubmitting={isAdjustingIngredient}
          errorMessage={ingredientActionError}
          onClose={() => {
            if (!isAdjustingIngredient) {
              setIngredientActionError('');
              setSelectedIngredient(null);
              setIngredientModalAction(null);
            }
          }}
          onSubmit={handleIngredientAdjust}
        />
      ) : null}
    </div>
  );
}
