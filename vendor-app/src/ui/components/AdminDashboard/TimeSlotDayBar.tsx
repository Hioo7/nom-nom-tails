import type { DayOfWeek } from '../../../types';

interface DayEntry {
  shortLabel: string;
  label: string;
  value: DayOfWeek;
}

const DAYS: DayEntry[] = [
  { shortLabel: 'Mon', label: 'Monday', value: 'MONDAY' },
  { shortLabel: 'Tue', label: 'Tuesday', value: 'TUESDAY' },
  { shortLabel: 'Wed', label: 'Wednesday', value: 'WEDNESDAY' },
  { shortLabel: 'Thu', label: 'Thursday', value: 'THURSDAY' },
  { shortLabel: 'Fri', label: 'Friday', value: 'FRIDAY' },
  { shortLabel: 'Sat', label: 'Saturday', value: 'SATURDAY' },
  { shortLabel: 'Sun', label: 'Sunday', value: 'SUNDAY' },
];

interface TimeSlotDayBarProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}

export default function TimeSlotDayBar({ activeDay, onDayChange }: TimeSlotDayBarProps) {
  return (
    <div className="overflow-x-auto rounded-box border border-base-200 bg-base-100 shadow-sm">
      <div className="flex min-w-max gap-2 p-2">
        {DAYS.map((day) => (
          <button
            type="button"
            key={day.value}
            className={`btn h-auto min-h-0 flex-col items-start gap-0 rounded-xl px-3 py-2 text-left ${
              activeDay === day.value
                ? 'btn-neutral shadow-sm'
                : 'btn-ghost border border-base-200'
            }`}
            onClick={() => onDayChange(day.value)}
          >
            <span className="text-[11px] font-medium uppercase tracking-wide opacity-70">
              {day.shortLabel}
            </span>
            <span className="text-sm font-semibold">{day.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
