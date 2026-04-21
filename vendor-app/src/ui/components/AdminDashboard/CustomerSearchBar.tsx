import { FiSearch } from 'react-icons/fi';

interface CustomerSearchBarProps {
  searchValue: string;
  totalCustomers: number;
  visibleCustomers: number;
  onSearchChange: (value: string) => void;
}

export default function CustomerSearchBar({
  searchValue,
  totalCustomers,
  visibleCustomers,
  onSearchChange,
}: CustomerSearchBarProps) {
  const isSearching = searchValue.trim().length > 0;
  const countLabel = isSearching
    ? `${visibleCustomers} of ${totalCustomers} customers`
    : `${totalCustomers} customer${totalCustomers !== 1 ? 's' : ''}`;

  return (
    <div className="sticky top-0 z-10 border-b border-base-200 bg-base-100/95 px-4 py-3 backdrop-blur-sm">
      <div className="mb-3">
        <h1 className="text-lg font-bold text-base-content">Customers</h1>
        <p className="text-xs text-base-content/50">{countLabel}</p>
      </div>

      <label className="input input-bordered input-sm flex items-center gap-2 bg-base-100">
        <FiSearch size={16} className="text-base-content/40" />
        <input
          type="text"
          className="grow"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search name or email"
          aria-label="Search customers"
        />
      </label>
    </div>
  );
}
