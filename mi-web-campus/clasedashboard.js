document.addEventListener('DOMContentLoaded', async () => {
    const listaComunicados = document.getElementById('listaComunicados');
    const userRol = localStorage.getItem('userRol'); // ejemplo: "estudiante"
    const token = localStorage.getItem('token'); 
    const params = new URLSearchParams(window.location.search);
    const materia = params.get('materia') || '';

    // ---------- Función para cargar comunicados ----------
    async function cargarComunicados() {
        try {
            const response = await fetch(`https://campus-backend-llfv.onrender.com/api/comunicados?rol=${userRol}`, {
                headers: { 'x-auth-token': token }
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
    }

    // Llamar la primera vez
    cargarComunicados();

    // ---------- Mostrar formulario para estudiantes ----------
    const studentActions = document.getElementById('studentActions');
    if (userRol === 'estudiante' && studentActions) {
        studentActions.innerHTML = `
            <section id="enviarSection">
                <h3>Enviar mensaje / entrega</h3>
                <form id="formEnviar" enctype="multipart/form-data">
                    <div>
                        <label>Título</label><br>
                        <input type="text" id="sub-titulo" name="titulo" required>
                    </div>
                    <div>
                        <label>Contenido (opcional)</label><br>
                        <textarea id="sub-contenido" name="contenido"></textarea>
                    </div>
                    <div>
                        <label>Adjuntar archivo (PDF / DOC / PPT / imagen) - opcional</label><br>
                        <input type="file" id="sub-archivo" name="archivo">
                    </div>
                    <div>
                        <label>Tipo</label>
                        <select id="sub-tipo" name="tipo">
                            <option value="mensaje">Mensaje</option>
                            <option value="entrega">Entrega</option>
                        </select>
                    </div>
                    <button type="submit">Enviar</button>
                </form>
                <p id="submitMsg"></p>
            </section>
        `;

        const formEnviar = document.getElementById('formEnviar');
        const submitMsg = document.getElementById('submitMsg');

        formEnviar.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitMsg.style.color = 'black';
            submitMsg.textContent = 'Enviando...';

            const titulo = document.getElementById('sub-titulo').value.trim();
            const contenido = document.getElementById('sub-contenido').value.trim();
            const tipo = document.getElementById('sub-tipo').value;
            const fileInput = document.getElementById('sub-archivo');

            const fd = new FormData();
            fd.append('titulo', titulo);
            fd.append('contenido', contenido);
            fd.append('tipo', tipo);
            fd.append('materia', materia);

            if (fileInput.files.length > 0) {
                fd.append('archivo', fileInput.files[0]);
            }

            try {
                const res = await fetch('https://campus-backend-llfv.onrender.com/api/submissions', {
                    method: 'POST',
                    headers: { 'x-auth-token': token },
                    body: fd
                });

                const data = await res.json();
                if (res.ok) {
                    submitMsg.style.color = 'green';
                    submitMsg.textContent = 'Enviado con éxito';
                    formEnviar.reset();
                    // recargar comunicados/envíos para ver el nuevo mensaje
                    cargarComunicados();
                } else {
                    submitMsg.style.color = 'red';
                    submitMsg.textContent = data.msg || 'Error al enviar';
                }
            } catch (err) {
                console.error(err);
                submitMsg.style.color = 'red';
                submitMsg.textContent = 'Error de conexión';
            }
        });
    }

        // ---------- Mostrar envíos si el usuario es profesor ----------
    if (userRol === 'profesor') {
        const listaEnvios = document.getElementById('listaEnvios');

        async function cargarEnvios() {
            try {
                const res = await fetch(`https://campus-backend-llfv.onrender.com/api/submissions?materia=${encodeURIComponent(materia)}`, {
                    headers: { 'x-auth-token': token }
                });
                const envios = await res.json();

                listaEnvios.innerHTML = '';

                if (envios.length === 0) {
                    listaEnvios.innerHTML = '<p>No hay envíos de estudiantes aún.</p>';
                } else {
                    envios.forEach(envio => {
                        const div = document.createElement('div');
                        div.classList.add('envio-card');
                        div.innerHTML = `
                            <h4>${envio.titulo} (${envio.tipo})</h4>
                            <p><strong>Alumno:</strong> ${envio.autor.nombre}</p>
                            <p>${envio.contenido || ''}</p>
                            ${envio.archivoAdjunto ? `<p><a href="${envio.archivoAdjunto}" target="_blank" rel="noopener">📎 Descargar archivo</a></p>` : ''}
                            <p><em>Enviado el ${new Date(envio.fechaEnvio).toLocaleString()}</em></p>
                        `;
                        listaEnvios.appendChild(div);
                    });
                }
            } catch (err) {
                console.error(err);
                listaEnvios.innerHTML = '<p>Error al cargar envíos.</p>';
            }
        }

        // cargar inmediatamente
        cargarEnvios();
    }


});
