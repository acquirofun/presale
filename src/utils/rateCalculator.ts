// Rate calculation utility
// Start date: September 2, 2026, 11:59 PM GMT
// Initial rate: 10,000 points per USDC
// Rate decrease: 250 points every 3 days

const START_DATE = new Date('2026-09-02T23:59:00Z');
const INITIAL_RATE = 10000;
const RATE_DECREASE = 250;
const PERIOD_DAYS = 3;

export interface RateInfo {
  currentRate: number;
  nextRate: number;
  periodsCompleted: number;
  nextRateDate: Date;
  timeUntilNextRate: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function calculateCurrentRate(): RateInfo {
  const now = new Date();
  const elapsedMs = now.getTime() - START_DATE.getTime();
  
  // Calculate completed 3-day periods
  const periodMs = PERIOD_DAYS * 24 * 60 * 60 * 1000;
  const periodsCompleted = Math.max(0, Math.floor(elapsedMs / periodMs));
  
  // Calculate current and next rates
  const currentRate = Math.max(0, INITIAL_RATE - (periodsCompleted * RATE_DECREASE));
  const nextRate = Math.max(0, currentRate - RATE_DECREASE);
  
  // Calculate next rate date
  const nextRateDate = new Date(START_DATE.getTime() + ((periodsCompleted + 1) * periodMs));
  
  // Calculate time until next rate change
  const timeUntilNextRateMs = nextRateDate.getTime() - now.getTime();
  const days = Math.floor(timeUntilNextRateMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeUntilNextRateMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeUntilNextRateMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeUntilNextRateMs % (1000 * 60)) / 1000);
  
  return {
    currentRate,
    nextRate,
    periodsCompleted,
    nextRateDate,
    timeUntilNextRate: {
      days: Math.max(0, days),
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      seconds: Math.max(0, seconds)
    }
  };
}