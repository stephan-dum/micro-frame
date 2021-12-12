const normalizeExternal = (rawExternal) => {
  if (typeof rawExternal === 'string') {
    return {
      type: 'module',
      name: rawExternal,
    };
  }
  if (Array.isArray(rawExternal)) {
    const [name, imports] = rawExternal;

    return {
      type: 'module',
      name,
      imports,
    };
  }

  return rawExternal;
}

module.exports = normalizeExternal;
