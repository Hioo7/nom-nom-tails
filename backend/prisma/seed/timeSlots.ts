import { DayOfWeek } from '@prisma/client';
import prisma from '../../src/lib/prisma';

export interface TimeSlotRecord {
  id: string;
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface TimeSlotsResult {
  mondayMorning: TimeSlotRecord;
  mondayEvening: TimeSlotRecord;
  tuesdayMorning: TimeSlotRecord;
  tuesdayEvening: TimeSlotRecord;
  wednesdayMorning: TimeSlotRecord;
  wednesdayEvening: TimeSlotRecord;
  thursdayMorning: TimeSlotRecord;
  thursdayEvening: TimeSlotRecord;
  fridayMorning: TimeSlotRecord;
  fridayEvening: TimeSlotRecord;
  saturdayBrunch: TimeSlotRecord;
  sundayBrunch: TimeSlotRecord;
}

const SLOT_DEFINITIONS: Array<{ key: keyof TimeSlotsResult; day: DayOfWeek; startTime: string; endTime: string }> = [
  { key: 'mondayMorning', day: DayOfWeek.MONDAY, startTime: '08:00', endTime: '11:00' },
  { key: 'mondayEvening', day: DayOfWeek.MONDAY, startTime: '18:00', endTime: '21:00' },
  { key: 'tuesdayMorning', day: DayOfWeek.TUESDAY, startTime: '08:00', endTime: '11:00' },
  { key: 'tuesdayEvening', day: DayOfWeek.TUESDAY, startTime: '18:00', endTime: '21:00' },
  { key: 'wednesdayMorning', day: DayOfWeek.WEDNESDAY, startTime: '08:00', endTime: '11:00' },
  { key: 'wednesdayEvening', day: DayOfWeek.WEDNESDAY, startTime: '18:00', endTime: '21:00' },
  { key: 'thursdayMorning', day: DayOfWeek.THURSDAY, startTime: '08:00', endTime: '11:00' },
  { key: 'thursdayEvening', day: DayOfWeek.THURSDAY, startTime: '18:00', endTime: '21:00' },
  { key: 'fridayMorning', day: DayOfWeek.FRIDAY, startTime: '08:00', endTime: '11:00' },
  { key: 'fridayEvening', day: DayOfWeek.FRIDAY, startTime: '18:00', endTime: '21:00' },
  { key: 'saturdayBrunch', day: DayOfWeek.SATURDAY, startTime: '09:00', endTime: '13:00' },
  { key: 'sundayBrunch', day: DayOfWeek.SUNDAY, startTime: '09:00', endTime: '13:00' },
];

export async function seedTimeSlots(): Promise<TimeSlotsResult> {
  const created = await prisma.$transaction(
    SLOT_DEFINITIONS.map((def) =>
      prisma.timeSlot.create({
        data: { day: def.day, startTime: def.startTime, endTime: def.endTime, isActive: true },
      }),
    ),
  );

  console.log(`  Created ${created.length} time slots.`);

  const result = {} as TimeSlotsResult;
  SLOT_DEFINITIONS.forEach((def, i) => {
    result[def.key] = created[i];
  });
  return result;
}
