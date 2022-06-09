// generate unique id.
// thanks to https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
export default function getUID() {
  return 'xxxyxx4xxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line
    let r = (Math.random() * 16) | 0;
    // eslint-disable-next-line
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
