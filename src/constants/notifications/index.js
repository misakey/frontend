export const MINIMAL = 'minimal';
export const MODERATE = 'moderate';
export const FREQUENT = 'frequent';

export const NOTIFICATIONS = [
  MINIMAL,
  MODERATE,
  FREQUENT,
];


// useful for slider component
export const NOTIFICATION_MAP = {
  0: MINIMAL,
  1: MODERATE,
  2: FREQUENT,
};
export const NOTIFICATION_MARKS = Object.entries(NOTIFICATION_MAP)
  .map(([value, label]) => ({ value: parseInt(value, 10), label }));
