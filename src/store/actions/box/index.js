export const BLUR_TEXT = Symbol('BLUR_TEXT');
export const CLEAR_TEXT = Symbol('CLEAR_TEXT');

export const blurText = ({ boxId, text }) => ({
  type: BLUR_TEXT,
  boxId,
  text,
});

export const clearText = ({ boxId }) => ({
  type: CLEAR_TEXT,
  boxId,
});
