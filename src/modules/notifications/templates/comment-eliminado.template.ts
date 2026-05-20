export const commentEliminadoTemplate = (username: string, commentContent: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #e74c3c;">Tu comentario fue eliminado</h2>
    <p>Hola <strong>${username}</strong>,</p>
    <p>
      Un moderador o administrador ha eliminado tu comentario:
    </p>
    <blockquote style="border-left: 4px solid #e74c3c; padding-left: 12px; color: #555;">
      "${commentContent}"
    </blockquote>
    <p>Si crees que esto fue un error, puedes contactar al equipo de soporte.</p>
    <br />
    <p style="color: #888; font-size: 12px;">— Equipo de DevCommunity</p>
  </div>
`;