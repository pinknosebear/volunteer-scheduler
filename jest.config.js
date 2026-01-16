module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: './src',
    testMatch: ['**/__tests__/**/*.ts'],
    collectCoverageFrom: [
        '**/*.ts',
        "!**/__tests__/**",
    ],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};

