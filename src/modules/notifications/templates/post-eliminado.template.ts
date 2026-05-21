export const postEliminadoTemplate = (username: string, postTitle: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #e74c3c;">Tu publicación fue eliminada</h2>
    <p>Hola <strong>${username}</strong>,</p>
    <p>
      Un moderador o administrador ha eliminado tu publicación 
      <strong>"${postTitle}"</strong> por incumplir las normas de la plataforma.
    </p>
    <p>Si crees que esto fue un error, puedes contactar al equipo de soporte.</p>
    <br />
    <p style="color: #888; font-size: 12px;">— Equipo de DevCommunity</p>
  </div>
`;