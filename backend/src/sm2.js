/**
 * SM-2 Spaced Repetition Algorithm
 * quality: 0 = blackout, 1 = wrong, 2 = wrong but easy, 3 = hard, 4 = good, 5 = perfect
 */
function sm2(card, quality) {
  let { ease_factor, interval, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ease_factor);
    }
    repetitions += 1;
  } else {
    // Incorrect — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor (min 1.3)
  ease_factor = ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  ease_factor = Math.max(1.3, parseFloat(ease_factor.toFixed(4)));

  const due_date = new Date();
  due_date.setDate(due_date.getDate() + interval);

  return { ease_factor, interval, repetitions, due_date: due_date.toISOString() };
}

module.exports = sm2;
