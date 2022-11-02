const { controls = {} } = window.lazyblocksConstructorData || window.lazyblocksGutenberg;

export default function getControlTypeData(name) {
  if (name && controls[name]) {
    return controls[name];
  }

  // Display the Undefined control if the requested control does not exists.
  if (controls.undefined) {
    return controls.undefined;
  }

  return false;
}
