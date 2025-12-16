// utils/calendar.ts - ICS calendar file generation
import type { WeeklyPlanType, DayOfWeek, MealTime } from '../types';
import { DAYS, MEAL_TIMES, DAY_OFFSETS, MEAL_ICONS } from '../constants';

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Meal time to hours mapping
const MEAL_TIMES_HOURS: Record<MealTime, { start: number; end: number }> = {
  breakfast: { start: 8, end: 9 },
  lunch: { start: 12, end: 13 },
  dinner: { start: 19, end: 21 }
};

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
    const eventDate = addDays(startDate, DAY_OFFSETS[day]);
    
    MEAL_TIMES.forEach(meal => {
      const mealSlot = dayPlan[meal];
      if (mealSlot) {
        const hours = MEAL_TIMES_HOURS[meal];
        const startTime = new Date(eventDate);
        startTime.setHours(hours.start, 0, 0, 0);
        const endTime = new Date(eventDate);
        endTime.setHours(hours.end, 0, 0, 0);

        const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
        const restaurant = mealSlot.restaurant;

        ics += `BEGIN:VEVENT
UID:${restaurant.id}-${day}-${meal}@dineahead
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:${MEAL_ICONS[meal]} ${mealLabel}: ${restaurant.name}
DESCRIPTION:${restaurant.cuisine} • ${restaurant.priceLevel} • ~$${restaurant.estimatedCost}\\n\\n${restaurant.address}\\n\\nBooked via DineAhead
LOCATION:${restaurant.address.replace(/,/g, '\\,')}
URL:${restaurant.yelpUrl}
END:VEVENT
`;
      }
    });
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
  endDate.setDate(date.getDate() + 6);
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