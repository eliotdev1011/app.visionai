function convertSecondsToDaysHoursMinutes(seconds) {
  const secondsInADay = 86400; // 24 * 60 * 60
  const secondsInAnHour = 3600; // 60 * 60
  const secondsInAMinute = 60;

  // Return only seconds if the total time is less than a minute
  if (seconds < secondsInAMinute) {
    return `${seconds}s`;
  }

  const days = Math.floor(seconds / secondsInADay);
  const remainingSecondsAfterDays = seconds % secondsInADay;
  const hours = Math.floor(remainingSecondsAfterDays / secondsInAnHour);
  const remainingSecondsAfterHours =
    remainingSecondsAfterDays % secondsInAnHour;
  const minutes = Math.floor(remainingSecondsAfterHours / secondsInAMinute);

  return `${days}d, ${hours}h, ${minutes}min`;
}

export default convertSecondsToDaysHoursMinutes;
