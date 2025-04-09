module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.extensions = [...webpackConfig.resolve.extensions, ".ts", ".tsx"];
      webpackConfig.resolve.modules = [__dirname + "/src", "node_modules"];
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "@": __dirname + "/src",
      };
      return webpackConfig;
    },
  },
};
