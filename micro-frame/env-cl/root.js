const root = async (context, isHydrate) => {
  console.log('## root context', isHydrate, context);
  const assets = [
    ...context.externalsEntryByChunkName.root,
    ...(context.assetsByChunkName.root || []),
  ];

  if (!isHydrate) {
    await context.setAssets(assets);
  }

  return {
    type: 'container',
    name: context.containerName,
  };
};

export default root;
