export const ENDPOINTS = {
    SIGNUP: '/auth/registration',
    ACTIVATE_PROFILE: '/auth/activate/:uuid',
    SIGNIN: '/auth/login',
    PROFILE: '/users/me',
    HOREKA_REQUESTS: '/requests/horeca',
    HOREKA_REQUESTS_TEMPLATE: '/requests/horeca/template',
    HOREKA_REQUEST: '/requests/horeca/:id',
    HOREKA_REQUESTS_FOR_PROVIDER: '/requests/provider/income',
    HOREKA_REQUESTS_FOR_PROVIDER_STATUS: '/requests/provider/income/status',
    PROVIDER_REQUEST: '/requests/provider',
    // APPROVE_PROVIDER_REQUEST: '/requests/provider/:id',
    CREATE_CHAT: '/chats',
    HOREKA_APPROVE_PROVIDER_REQUEST: '/requests/horeca/approve'
}