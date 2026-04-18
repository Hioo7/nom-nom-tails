import { FiShoppingBag } from 'react-icons/fi';

export default function ProductsTab() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="card bg-base-200 shadow-sm w-full max-w-sm">
        <div className="card-body items-center text-center gap-4">
          <FiShoppingBag className="text-base-content/20" size={72} />
          <div className="flex flex-col gap-1">
            <h2 className="card-title justify-center text-base-content/60">Products</h2>
            <p className="text-sm text-base-content/40">
              Coming soon — manage your product catalogue here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
