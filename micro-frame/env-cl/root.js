const root = (context) => {
  const [containerName, path] = Array.from(Object.entries(context.entryByChunkName))[0];
  console.log('# root', containerName, context);
  return context.setAssets([
    ...(context.assetsByChunkName[containerName] || []),
    ...context.externalsEntryByChunkName.root,
  ])
    .then(() => context.load(path))
    .then((module) => module.default || module)
    .then((module) => module(context));
};

export default root;
