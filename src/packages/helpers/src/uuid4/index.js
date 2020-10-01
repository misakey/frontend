import uuid4 from 'uuid/v4';

// Generates RFC4122 version 4 guid
export const uuid4RFC4122 = () => uuid4().replace(/-/g, '');

export default uuid4;
