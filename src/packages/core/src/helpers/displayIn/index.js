/**
 * Return a bool depending of media query in JS and so avoid rendering
 * Example: render = () => displayIn(['md', 'lg']) && <Component />
 * @param width
 * @param includes
 * @param excludes
 * @returns {boolean}
 */
function displayIn(width, includes = [], excludes = []) {
  return (includes.length === 0 || includes.includes(width))
    && (excludes.length === 0 || !excludes.includes(width));
}

export default displayIn;
