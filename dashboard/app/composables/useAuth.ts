/**
 * useAuth Composable
 * Provides authentication functionality for Vue components
 */

import { ref, computed } from 'vue';
import { axios } from '../../infrastructure';

import {
    LoginUseCase,
    AuthRemoteDataSource,
    AuthRepository,
    type AuthPayload,
    type User
} from '../../core/auth';

// Global state (singleton pattern for auth state)
const user = ref<User | null>(null);
const token = ref<string | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

export function useAuth() {
    const isAuthenticated = computed(() => !!token.value);

    // Initialize use case with dependency injection
    const createLoginUseCase = () => {
        const datasource = new AuthRemoteDataSource(axios);
        const repository = new AuthRepository(datasource);
        return new LoginUseCase(repository);
    };

    async function login(payload: AuthPayload): Promise<boolean> {
        loading.value = true;
        error.value = null;

        try {
            const loginUseCase = createLoginUseCase();
            const result = await loginUseCase.execute(payload);

            if (result.success) {
                user.value = result.data.user;
                token.value = result.data.token;

                // Set cookie for SSR middleware
                const tokenCookie = useCookie('token');
                tokenCookie.value = result.data.token;

                // Store user data in cookie as well
                const userCookie = useCookie('user');
                userCookie.value = JSON.stringify(result.data.user);

                return true;
            } else {
                error.value = result.error.message;
                return false;
            }
        } catch (e) {
            error.value = 'An unexpected error occurred';
            return false;
        } finally {
            loading.value = false;
        }
    }

    function logout(): void {
        user.value = null;
        token.value = null;

        // Clear cookies
        const tokenCookie = useCookie('token');
        const userCookie = useCookie('user');
        tokenCookie.value = null;
        userCookie.value = null;

        // Redirect to login
        navigateTo('/auth/login');
    }

    // Initialize from cookie on composable creation
    function initFromCookie(): void {
        const tokenCookie = useCookie('token');
        const userCookie = useCookie('user');

        if (tokenCookie.value) {
            token.value = tokenCookie.value;
        }

        if (userCookie.value) {
            try {
                user.value = JSON.parse(userCookie.value as string);
            } catch {
                user.value = null;
            }
        }
    }

    // Initialize on first use
    if (import.meta.client && !token.value) {
        initFromCookie();
    }

    return {
        user: computed(() => user.value),
        token: computed(() => token.value),
        isAuthenticated,
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        login,
        logout,
        initFromCookie,
    };
}