import { Config } from 'jest'

const config: Config = {
  bail: 1,
  testEnvironment: 'node',
  transform: { '^.+\\.ts$': 'ts-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    '~battle/(.*)': '<rootDir>/src/modules/battle/$1',
    '~character/(.*)': '<rootDir>/src/modules/character/$1',
    '~shared/(.*)': '<rootDir>/src/modules/shared/$1',
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
  coveragePathIgnorePatterns: [
    '.*(\\.|-)config\\.ts$',
    '.*index\\.ts$',
    '.*\\.spec\\.ts$',
    '.*\\.module\\.ts$',
    '.*\\.dto\\.ts$',
    '.*\\.decorator\\.ts$',
    '.*\\.mock\\.ts$',
    '<rootDir>/dist/',
    '<rootDir>/test/',
    '<rootDir>/data/',
    '<rootDir>/coverage/',
    '<rootDir>/node_modules/',
    '<rootDir>/src/main.ts',
  ],
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
}

export default config
