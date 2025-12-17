// utils/calendar.ts - Export meal plans to calendar formats
import type { WeeklyPlanType, MealTime } from '../types';
import { DAYS, MEAL_TIMES } from '../constants';

// Get time for meal type
function getMealTime(meal: MealTime): { hour: number; minute: number } {
  switch (meal) {
    case 'breakfast':
      return { hour: 8, minute: 0 };
    case 'lunch':
      return { hour: 12, minute: 0 };
    case 'dinner':
      return { hour: 18, minute: 0 };
  }
}

// Format date for iCalendar
function formatICalDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Get next occurrence of a day of week
function getNextDate(dayOfWeek: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayOfWeek.toLowerCase());
  const today = new Date();
  const currentDay = today.getDay();
  
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }
  
  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget);
  return result;
}

export function exportToCalendar(plan: WeeklyPlanType, location: string): Blob {
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DineAhead//Meal Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:DineAhead Meal Plan',
    'X-WR-TIMEZONE:America/New_York',
  ];

  DAYS.forEach(day => {
    MEAL_TIMES.forEach(meal => {
      const slot = plan[day][meal];
      if (!slot) return;

      const restaurant = slot.restaurant;
      const date = getNextDate(day);
      const mealTime = getMealTime(meal);
      
      date.setHours(mealTime.hour, mealTime.minute, 0, 0);
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(endDate.getHours() + 1);

      const mealLabel = meal.charAt(0).toUpperCase() + meal.slice(1);
      
      icalContent.push(
        'BEGIN:VEVENT',
        `UID:${Date.now()}-${day}-${meal}@dineahead.app`,
        `DTSTAMP:${formatICalDate(new Date())}`,
        `DTSTART:${formatICalDate(startDate)}`,
        `DTEND:${formatICalDate(endDate)}`,
        `SUMMARY:${mealLabel}: ${restaurant.name}`,
        `DESCRIPTION:${restaurant.cuisine} • ${restaurant.priceLevel} • $${restaurant.estimatedCost}\\n\\nRating: ${restaurant.rating}/5 (${restaurant.reviewCount} reviews)`,
        `LOCATION:${restaurant.address}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      );
    });
  });

  icalContent.push('END:VCALENDAR');
  
  return new Blob([icalContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
}

export function exportToPDF(plan: WeeklyPlanType, filters: any): Blob {
  // Placeholder for PDF export
  // In a real implementation, you'd use a library like jsPDF
  let text = `DineAhead Weekly Meal Plan\n\n`;
  text += `Location: ${filters.location}\n`;
  text += `Budget: $${filters.budget}\n\n`;
  
  DAYS.forEach(day => {
    text += `${day.toUpperCase()}\n`;
    MEAL_TIMES.forEach(meal => {
      const slot = plan[day][meal];
      if (slot) {
        text += `  ${meal}: ${slot.restaurant.name} ($${slot.restaurant.estimatedCost})\n`;
      }
    });
    text += '\n';
  });
  
  return new Blob([text], { type: 'text/plain' });
}