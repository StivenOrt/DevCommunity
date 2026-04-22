export const POST_ERRORS = {
    NOT_FOUND: () => (
        {
            error: 404,
            message: 'Post(s) no encontrado(s)'
        }
    ),
    FORBIDDEN: (action: string) => (
        {
            error: 403,
            message: `No tienes permiso para ${action} esta publicación`
        }
    )
}

export const JWT_ERRORS = {
    UNAUTHORIZED: () => (
        {
            statusCode: 401,
            message: 'Credenciales inválidas, por favor, inicia sesión',
            error: 'Unauthorized',
        }
    )
}