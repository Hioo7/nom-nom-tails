import { FiClipboard } from 'react-icons/fi';

export default function OrdersTab() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="card bg-base-200 shadow-sm w-full max-w-sm">
        <div className="card-body items-center text-center gap-4">
          <FiClipboard className="text-base-content/20" size={72} />
          <div className="flex flex-col gap-1">
            <h2 className="card-title justify-center text-base-content/60">Orders</h2>
            <p className="text-sm text-base-content/40">
              Coming soon — track and manage customer orders here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
