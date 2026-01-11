import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                localStorage: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly',
                BroadcastChannel: 'readonly',
                navigator: 'readonly',
                requestIdleCallback: 'readonly',
                // App globals
                BIBLE_DATA: 'readonly',
                NRT_DATA: 'readonly',
                KTB_DATA: 'readonly',
                KTB_BOOK_MAP: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-console': 'off',
            'prefer-const': 'error',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'multi-line']
        }
    },
    {
        ignores: ['app/js/data/**', 'node_modules/**', 'temp_inspect/**']
    }
];
