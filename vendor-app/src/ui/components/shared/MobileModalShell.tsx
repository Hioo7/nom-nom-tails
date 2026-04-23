import type { ReactNode, RefObject } from 'react';

interface MobileModalShellProps {
  dialogRef: RefObject<HTMLDialogElement | null>;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
}

export default function MobileModalShell({
  dialogRef,
  title,
  description,
  icon,
  onClose,
  children,
  footer,
  maxWidthClassName = 'sm:max-w-md',
}: MobileModalShellProps) {
  return (
    <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div
        className={`modal-box flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-3xl p-0 gap-0 sm:rounded-2xl ${maxWidthClassName}`}
      >
        <div className="shrink-0 border-b border-base-200 px-4 pb-3 pt-4">
          <div className="flex items-start gap-3">
            {icon ? (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-base-200 text-base-content">
                {icon}
              </div>
            ) : null}
            <div className="min-w-0">
              <h3 className="text-base font-bold text-base-content">{title}</h3>
              {description ? (
                <div className="mt-1 text-sm leading-6 text-base-content/60">{description}</div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-4">{children}</div>
        </div>

        {footer ? (
          <div className="shrink-0 border-t border-base-200 bg-base-100 px-4 py-3">{footer}</div>
        ) : null}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
}
