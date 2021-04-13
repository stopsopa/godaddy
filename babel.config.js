
module.exports = { // https://jestjs.io/docs/tutorial-react#setup-without-create-react-app
  presets: [
    [
      '@babel/preset-env', // https://stackoverflow.com/a/56267658
      {
        targets: {
          node: 'current',
        },
      }
    ],
    '@babel/preset-react'
  ],
};