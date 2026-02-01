export default defineNuxtRouteMiddleware((to, from) => {
  const token = useCookie("token");
    
  if (!token.value && to.path.startsWith('/auth') === false) {
    return navigateTo('/auth/login')
  }
})