document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const contentDiv = document.getElementById('card-content');
    
    // 1. REFERENCIAS AL MODAL (VENTANA)
    // Buscamos los elementos que creaste en el HTML
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('img-expanded');
    const closeModal = document.getElementById('close-modal');

    // 2. Obtener ID de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) { loadingDiv.textContent = 'Error: Falta ID.'; return; }

    // 3. Cargar la Base de Datos
    fetch('data.json')
        .then(response => { if (!response.ok) throw new Error('Error carga JSON'); return response.json(); })
        .then(data => {
            const user = data.usuarios.find(u => u.id === userId);
            const global = data.global;

            if (!user) { loadingDiv.textContent = 'Usuario no encontrado.'; return; }

            // 4. Rellenar Textos e Imágenes principales
            document.title = `${user.nombre} - ${global.empresa}`;
            document.getElementById('profile-img').src = user.foto;
            document.getElementById('profile-name').textContent = user.nombre;
            document.getElementById('profile-role').textContent = user.cargo;
            document.getElementById('profile-company').textContent = global.empresa;
            
            // Botones
            document.getElementById('btn-call').href = `tel:${user.telefono}`;
            document.getElementById('btn-wa').href = `https://wa.me/${user.whatsapp}`;
            document.getElementById('btn-email').href = `mailto:${user.email}`;

            // Enlaces
            document.getElementById('link-web').href = global.sitio_web;
            document.getElementById('text-web').textContent = global.sitio_web_texto;
            document.getElementById('link-insta').href = global.instagram_url;
            document.getElementById('text-insta').textContent = global.instagram_usuario;

            // 5. GENERAR GALERÍA CON LA LÓGICA DE CLIC (IMPORTANTE)
            const galleryContainer = document.getElementById('gallery-container');
            
            global.galeria.forEach(imgSrc => {
                // Crear la imagen pequeña
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = "Galería Fase 2";
                
                // --- AQUÍ ESTÁ LA MAGIA QUE FALTABA ---
                // Al hacer click, mostramos el modal (display: flex) y ponemos la foto grande
                img.onclick = function(){
                    modal.style.display = "flex"; 
                    modalImg.src = this.src; 
                }
                
                galleryContainer.appendChild(img);
            });

            // 6. CERRAR EL MODAL
            // Al tocar la X
            if(closeModal) {
                closeModal.onclick = function() { 
                    modal.style.display = "none"; 
                }
            }
            // Al tocar el fondo negro
            if(modal) {
                modal.onclick = function(event) {
                    if (event.target === modal) { 
                        modal.style.display = "none"; 
                    }
                }
            }

            // Botón descargar contacto
            document.getElementById('btn-save').addEventListener('click', (e) => {
                e.preventDefault(); downloadVCard(user, global);
            });

            // Mostrar todo
            loadingDiv.style.display = 'none'; contentDiv.style.display = 'block';
        })
        .catch(error => { loadingDiv.textContent = error.message; });
});

// Función para descargar vCard
function downloadVCard(user, global) {
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
    link.href = url; link.download = `${user.nombre.replace(' ', '_')}.vcf`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
