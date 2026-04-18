import { useEffect, useRef } from 'react';
import { FiLogOut } from 'react-icons/fi';

interface LogoutConfirmModalProps {
  onConfirm: () => void;
  onClose: () => void;
}

export default function LogoutConfirmModal({ onConfirm, onClose }: LogoutConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-error/10 p-2 rounded-full">
            <FiLogOut size={20} className="text-error" />
          </div>
          <h3 className="font-bold text-lg">Log Out</h3>
        </div>
        <p className="text-base-content/70 text-sm">
          Are you sure you want to log out? You'll need to sign in again to access the portal.
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Log Out
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
