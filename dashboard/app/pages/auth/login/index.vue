<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const toast = useToast()
const router = useRouter()

const fields: AuthFormField[] = [
    {
        name: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true
    },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter your password',
        required: true
    }
]

definePageMeta({
    layout: "auth"
});

const { login, loading, error } = useAuth()

const schema = z.object({
    email: z.email('Invalid email'),
    password: z.string('Password is required').min(6, 'Must be at least 6 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
    const success = await login({
        username: payload.data.email,
        password: payload.data.password
    })
    
    if (success) {
        toast.add({
            title: 'Login Successful',
            description: 'Welcome back!',
            color: 'success',
        })
        router.push('/')
    } else {
        toast.add({
            title: 'Login Failed',
            description: error.value || 'Invalid credentials',
            color: 'error',
        })
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <UPageCard class="backdrop-blur-sm bg-gray-800/50 border border-gray-700">
                <UAuthForm 
                    :schema="schema" 
                    title="Welcome Back" 
                    description="Enter your credentials to access your dashboard."
                    icon="i-lucide-lock" 
                    :fields="fields" 
                    :loading="loading"
                    @submit="onSubmit"
                >
                    <template #submit>
                        <UButton 
                            type="submit" 
                            block 
                            :loading="loading"
                        >
                            <template #leading>
                                <UIcon name="i-lucide-log-in" />
                            </template>
                            Sign In
                        </UButton>
                    </template>
                </UAuthForm>
            </UPageCard>
            
            <!-- Demo credentials hint -->
            <div class="mt-4 text-center text-sm text-gray-400">
                <p>Demo: Use any email and password (min 6 chars)</p>
            </div>
        </div>
    </div>
</template>
