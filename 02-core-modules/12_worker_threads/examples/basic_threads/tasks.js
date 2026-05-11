(() => {
  // Keep the worker busy for a few seconds so CPU usage can be inspected.
  const pauseMs = 5000;
  const endTime = Date.now() + pauseMs;
  let result = 0;

  while (Date.now() < endTime) {
    result += Math.sqrt(Math.random());
  }

  return result;
})();
