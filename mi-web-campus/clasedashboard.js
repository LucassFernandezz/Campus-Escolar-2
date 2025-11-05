document.addEventListener('DOMContentLoaded', async () => {
    const listaComunicados = document.getElementById('listaComunicados');
    const rolUsuario = localStorage.getItem('userRol'); // ejemplo: "estudiante"
    const token = localStorage.getItem('token'); // si quieres usar auth

    try {
        const response = await fetch(`http://localhost:5000/api/comunicados?rol=${rolUsuario}`, {
            headers: {
                'x-auth-token': token // si tu backend requiere auth
            }
        });
        const comunicados = await response.json();

        listaComunicados.innerHTML = '';

        if (comunicados.length === 0) {
            listaComunicados.innerHTML = '<p>No hay comunicados para mostrar.</p>';
        } else {
            comunicados.forEach(c => {
                const div = document.createElement('div');
                div.classList.add('comunicado-card');
                div.innerHTML = `
                    <h3>${c.titulo}</h3>
                    <p>${c.contenido}</p>
                    <p><em>Publicado por: ${c.autor.nombre} (${c.autor.rol}) el ${new Date(c.fechaPublicacion).toLocaleDateString()}</em></p>
                `;
                listaComunicados.appendChild(div);
            });
        }

    } catch (error) {
        console.error('Error al cargar comunicados:', error);
        listaComunicados.innerHTML = '<p>Error al cargar los comunicados.</p>';
    }
});
