module.exports = function (api) {
  api.cache(true);

  // Absolute path so Metro's Babel worker always resolves (cwd-independent)
  const workletsBabelPlugin = (() => {
    try {
      return require.resolve('react-native-worklets/plugin');
    } catch (e) {
      throw new Error(
        'Missing peer dependency "react-native-worklets". From the mobile folder run: npx expo install react-native-worklets'
      );
    }
  })();

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          lazyImports: true,
          jsxRuntime: 'automatic',
          // Preset only adds worklets if require.resolve("react-native-worklets") works in this
          // process; when it fails (Metro worker cwd), it wrongly falls back to reanimated/plugin.
          // We inject worklets explicitly below and disable auto injection here.
          reanimated: false,
        },
      ],
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': '.',
          },
        },
      ],
      // Must be last — Reanimated 4 / Expo 54
      workletsBabelPlugin,
    ],
  };
};
