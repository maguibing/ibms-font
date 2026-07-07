export function useDateDisabled() {
  function getTodayStartTime() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return startOfToday.getTime();
  }

  function getTodayEndTime() {
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return endOfToday.getTime();
  }

  function disableFutureDate(timestamp: number) {
    return timestamp > getTodayEndTime();
  }

  function disablePastDate(timestamp: number) {
    return timestamp < getTodayStartTime();
  }

  return {
    getTodayStartTime,
    getTodayEndTime,
    disableFutureDate,
    disablePastDate
  };
}
