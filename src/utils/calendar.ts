// utils/calendar.ts - ICS calendar file generation
import type  { WeeklyPlanType, DayOfWeek } from '../types';
import { DAYS, DAY_OFFSETS } from '../constants';

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function generateICSFile(plan: WeeklyPlanType, startDate: Date): string {
  let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DineAhead//Meal Plan//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:DineAhead Meal Plan
`;

  DAYS.forEach(day => {
    const dayPlan = plan[day];
    if (dayPlan) {
      const eventDate = addDays(startDate, DAY_OFFSETS[day]);
      const startTime = new Date(eventDate);
      startTime.setHours(19, 0, 0, 0); // 7 PM default
      const endTime = new Date(startTime);
      endTime.setHours(21, 0, 0, 0); // 9 PM

      ics += `BEGIN:VEVENT
UID:${dayPlan.restaurant.id}-${day}@dineahead
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:🍽️ ${dayPlan.restaurant.name}
DESCRIPTION:${dayPlan.restaurant.cuisine} • ${dayPlan.restaurant.priceLevel} • ~$${dayPlan.restaurant.estimatedCost}\\n\\n${dayPlan.restaurant.address}\\n\\nBooked via DineAhead
LOCATION:${dayPlan.restaurant.address.replace(/,/g, '\\,')}
URL:${dayPlan.restaurant.yelpUrl}
END:VEVENT
`;
    }
  });

  ics += 'END:VCALENDAR';
  return ics;
}

export function getNextMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

export function formatWeekDisplay(date: Date): string {
  const endDate = new Date(date);
  endDate.setDate(date.getDate() + 4);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${date.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
}

export function downloadCalendar(plan: WeeklyPlanType, startDate: Date): void {
  const icsContent = generateICSFile(plan, startDate);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'dineahead-meal-plan.ics';
  link.click();
  URL.revokeObjectURL(link.href);
}