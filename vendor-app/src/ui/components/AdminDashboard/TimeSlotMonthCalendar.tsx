import { useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { DayOfWeek } from '../../../types';

const DAY_OF_WEEK: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

interface TimeSlotMonthCalendarProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
}

export default function TimeSlotMonthCalendar({ activeDay, onDayChange }: TimeSlotMonthCalendarProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const [calendarDate, setCalendarDate] = useState<{ year: number; month: number }>({
    year: currentYear,
    month: currentMonth,
  });

  const isCurrentMonth =
    calendarDate.year === currentYear && calendarDate.month === currentMonth;

  const activeDayIndex = DAY_OF_WEEK.indexOf(activeDay); // 0=Sun … 6=Sat

  const calendarGrid = useMemo(() => {
    const { year, month } = calendarDate;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    type Cell = null | { day: number; dayOfWeek: DayOfWeek; isToday: boolean; isPast: boolean };
    const cells: Cell[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dayOfWeek = DAY_OF_WEEK[date.getDay()];
      const isToday = date.getTime() === today.getTime();
      const isPast = date.getTime() < today.getTime();
      cells.push({ day: d, dayOfWeek, isToday, isPast });
    }

    while (cells.length % 7 !== 0) cells.push(null);

    const weeks: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return weeks;
  }, [calendarDate]);

  const prevMonth = () =>
    setCalendarDate((d) => ({
      year: d.month === 0 ? d.year - 1 : d.year,
      month: d.month === 0 ? 11 : d.month - 1,
    }));

  const nextMonth = () =>
    setCalendarDate((d) => ({
      year: d.month === 11 ? d.year + 1 : d.year,
      month: d.month === 11 ? 0 : d.month + 1,
    }));

  const monthLabel = new Date(calendarDate.year, calendarDate.month).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="rounded-box border border-base-200 bg-base-100 shadow-sm p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={prevMonth}
          disabled={isCurrentMonth}
        >
          <FiChevronLeft size={18} />
        </button>
        <span className="text-sm font-bold">{monthLabel}</span>
        <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={nextMonth}>
          <FiChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su', 'M', 'T', 'W', 'Th', 'F', 'S'].map((h, i) => (
          <div
            key={h}
            className={`text-center text-xs font-semibold py-1 ${
              i === activeDayIndex ? 'text-primary' : 'text-base-content/40'
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Date grid */}
      {calendarGrid.map((week, wi) => (
        <div key={wi} className="grid grid-cols-7">
          {week.map((cell, di) => {
            if (!cell) return <div key={di} />;
            const isActive = cell.dayOfWeek === activeDay;
            return (
              <button
                key={di}
                type="button"
                disabled={cell.isPast}
                onClick={() => onDayChange(cell.dayOfWeek)}
                className={`relative flex items-center justify-center mx-auto my-0.5 w-9 h-9 rounded-full text-sm font-medium transition-all
                  ${cell.isPast
                    ? 'text-base-content/20 cursor-not-allowed'
                    : isActive
                    ? 'bg-orange-500 text-white'
                    : cell.isToday
                    ? 'ring-2 ring-primary ring-offset-1 hover:bg-base-200'
                    : 'hover:bg-base-200 text-base-content'
                  }`}
              >
                {cell.day}
              </button>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-base-200 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs text-base-content/50">
          <div className="w-3 h-3 rounded-full bg-orange-500" /> Selected day-of-week
        </div>
        <div className="flex items-center gap-1.5 text-xs text-base-content/50">
          <div className="w-3 h-3 rounded-full ring-2 ring-primary" /> Today
        </div>
      </div>
    </div>
  );
}
