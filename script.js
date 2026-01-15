document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('card-content');

    // 1. Obtener el ID del usuario de la URL (ejemplo: ?id=juan)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        loadingDiv.textContent = 'Error: Falta el ID de usuario en la URL.';
        return;
    }

    // 2. Cargar la base de datos JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('No se pudo cargar el archivo de datos.');
            return response.json();
        })
        .then(data => {
            // 3. Buscar el usuario específico
            const user = data.usuarios.find(u => u.id === userId);
            const global = data.global;

            if (!user) {
                loadingDiv.textContent = 'Error: Usuario no encontrado.';
                return;
            }

            // 4. Rellenar la interfaz con los datos
            document.title = `${user.nombre} - ${global.empresa}`;
            document.getElementById('profile-img').src = user.foto;
            document.getElementById('profile-name').textContent = user.nombre;
            document.getElementById('profile-role').textContent = user.cargo;
            document.getElementById('profile-company').textContent = global.empresa;

            // Botones de acción
            document.getElementById('btn-call').href = `tel:${user.telefono}`;
            document.getElementById('btn-wa').href = `https://wa.me/${user.whatsapp}`;
            document.getElementById('btn-email').href = `mailto:${user.email}`;

            // Enlaces globales
            document.getElementById('link-web').href = global.sitio_web;
            document.getElementById('text-web').textContent = global.sitio_web_texto;
            document.getElementById('link-insta').href = global.instagram_url;
            document.getElementById('text-insta').textContent = global.instagram_usuario;

            // Galería
            const galleryContainer = document.getElementById('gallery-container');
            global.galeria.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = "Imagen de galería";
                galleryContainer.appendChild(img);
            });

            // Configurar botón de descarga de vCard
            document.getElementById('btn-save').addEventListener('click', (e) => {
                e.preventDefault();
                downloadVCard(user, global);
            });

            // Mostrar el contenido
            loadingDiv.style.display = 'none';
            contentDiv.style.display = 'block';
        })
        .catch(error => {
            loadingDiv.textContent = `Error: ${error.message}`;
        });
});

// Función para generar y descargar el archivo .vcf
function downloadVCard(user, global) {
    // Separar nombre y apellido para la vCard (simple)
    const nameParts = user.nombre.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const vcard = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName};;;
FN:${user.nombre}
ORG:${global.empresa}
TITLE:${user.cargo}
TEL;TYPE=CELL:${user.telefono}
EMAIL;TYPE=WORK:${user.email}
URL:${global.sitio_web}
X-SOCIALPROFILE;TYPE=instagram:${global.instagram_usuario}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.nombre.replace(' ', '_')}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
