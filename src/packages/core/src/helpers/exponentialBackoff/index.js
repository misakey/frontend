/**
 * @param {number} attempt nth attempt
 * @param {number}[startDelay] start delay to compute next attempt
 */
export default (attempt, startDelay = 1) => attempt ** 2 * startDelay * 1000;
