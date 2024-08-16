module.exports = {
  '*.ts': (files) => [
    `prettier --write ${files.join(' ')}`,
    `eslint --fix  ${files.join(' ')}`,
    'tsc -p tsconfig.json --noEmit',
  ],
};
