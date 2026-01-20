// Navegación móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            course: document.getElementById('course').value,
            message: document.getElementById('message').value
        };
        
        console.log('Datos del formulario:', formData);
        alert('¡Gracias por tu solicitud! Nos pondremos en contacto contigo en las próximas 24 horas.');
        contactForm.reset();
    });
}

// Animación de scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            e.preventDefault();
            window.scrollTo({
                top: targetElement.offsetTop - 100,
                behavior: 'smooth'
            });
        }
    });
});

// Header con efecto de scroll
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
        
        if (scrollTop > lastScrollTop) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
    } else {
        header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// ========== CÓDIGO PARA EL MAPA INTERACTIVO ==========

// Datos de las sedes de la autoescuela
const locations = [
    {
        id: 0,
        name: "AutoVial Centro",
        address: "Calle Conducción Segura, 123, 28001 Madrid",
        phone: "+34 912 345 678",
        schedule: "L-V: 9:00-20:00, S: 9:00-14:00",
        coordinates: [40.4168, -3.7038],
        type: "principal",
        markerColor: "#e74c3c"
    },
    {
        id: 1,
        name: "AutoVial Norte",
        address: "Avenida de la Seguridad, 45, 28002 Madrid",
        phone: "+34 913 456 789",
        schedule: "L-V: 8:30-19:30, S: 9:00-13:00",
        coordinates: [40.4525, -3.6900],
        type: "secundaria",
        markerColor: "#3498db"
    },
    {
        id: 2,
        name: "AutoVial Sur",
        address: "Plaza del Conductor, 78, 28005 Madrid",
        phone: "+34 914 567 890",
        schedule: "L-V: 9:00-20:00, S: 10:00-15:00",
        coordinates: [40.4050, -3.7120],
        type: "secundaria",
        markerColor: "#3498db"
    },
    {
        id: 3,
        name: "AutoVial Este",
        address: "Calle del Aprendizaje, 22, 28007 Madrid",
        phone: "+34 915 678 901",
        schedule: "L-V: 8:00-19:00, S: Cerrado",
        coordinates: [40.4200, -3.6700],
        type: "practicas",
        markerColor: "#2ecc71"
    }
];

// Variables globales para el mapa
let map = null;
let markers = [];

// Inicializar el mapa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de AutoVial Autoescuela cargada correctamente');
    
    // Inicializar el mapa si existe el elemento
    if (document.getElementById('autoescuelaMap')) {
        setTimeout(() => {
            initMap();
            setupLocationSelection();
            setupMapControls();
        }, 500); // Pequeño retraso para asegurar que el DOM esté completamente cargado
    }
    
    // Añadir efecto de carga inicial a las tarjetas
    setTimeout(() => {
        document.querySelectorAll('.service-card, .course-card').forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 300);
});

// Función para inicializar el mapa de Leaflet
function initMap() {
    console.log('Inicializando mapa...');
    
    // Verificar si el contenedor del mapa existe y tiene dimensiones
    const mapContainer = document.getElementById('autoescuelaMap');
    if (!mapContainer) {
        console.error('No se encontró el contenedor del mapa');
        return;
    }
    
    // Centrar el mapa en Madrid
    map = L.map('autoescuelaMap').setView([40.4168, -3.7038], 12);
    
    // Añadir capa de tiles de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);
    
    // Añadir marcadores para cada sede
    locations.forEach(location => {
        // Crear icono personalizado
        const customIcon = L.divIcon({
            html: `<div style="background-color: ${location.markerColor}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${location.id + 1}</div>`,
            className: 'custom-marker',
            iconSize: [25, 25],
            iconAnchor: [12, 25]
        });
        
        // Crear el marcador
        const marker = L.marker(location.coordinates, { icon: customIcon })
            .addTo(map)
            .bindPopup(createPopupContent(location));
        
        // Almacenar referencia al marcador
        markers.push(marker);
        
        // Evento al hacer clic en el marcador
        marker.on('click', () => {
            setActiveLocation(location.id);
        });
    });
    
    // Ajustar la vista para mostrar todos los marcadores
    setTimeout(() => {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }, 100);
    
    console.log('Mapa inicializado correctamente');
}

// Crear contenido para el popup del marcador
function createPopupContent(location) {
    return `
        <div class="map-popup">
            <h3>${location.name}</h3>
            <p><i class="fas fa-map-marker-alt"></i> ${location.address}</p>
            <p><i class="fas fa-phone"></i> ${location.phone}</p>
            <p><i class="fas fa-clock"></i> ${location.schedule}</p>
            <p><i class="fas fa-car"></i> ${getLocationTypeText(location.type)}</p>
            <a href="#contacto" style="display: inline-block; margin-top: 10px;">Solicitar información</a>
        </div>
    `;
}

// Obtener texto descriptivo para el tipo de sede
function getLocationTypeText(type) {
    switch(type) {
        case 'principal': return 'Sede principal';
        case 'secundaria': return 'Sede secundaria';
        case 'practicas': return 'Centro de prácticas';
        default: return 'Sede';
    }
}

// Configurar la selección de sedes en la barra lateral
function setupLocationSelection() {
    const locationItems = document.querySelectorAll('.location-item');
    
    locationItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Evitar que se active dos veces si se hace clic en el botón
            if (e.target.classList.contains('btn-location-select')) return;
            
            const locationId = parseInt(item.getAttribute('data-location'));
            setActiveLocation(locationId);
        });
        
        // También manejar clics en el botón
        const button = item.querySelector('.btn-location-select');
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que se active el evento del item
                const locationId = parseInt(item.getAttribute('data-location'));
                setActiveLocation(locationId);
            });
        }
    });
}

// Establecer una sede como activa
function setActiveLocation(locationId) {
    console.log('Activando ubicación:', locationId);
    
    // Actualizar elemento activo en la barra lateral
    document.querySelectorAll('.location-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`.location-item[data-location="${locationId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Centrar el mapa en la ubicación seleccionada
    const location = locations[locationId];
    if (location && map) {
        map.setView(location.coordinates, 15);
        
        // Abrir el popup del marcador correspondiente
        markers[locationId].openPopup();
    }
}

// Configurar controles del mapa
function setupMapControls() {
    // Botón "Mi ubicación"
    const btnLocateMe = document.getElementById('btn-locate-me');
    if (btnLocateMe) {
        btnLocateMe.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const userCoords = [position.coords.latitude, position.coords.longitude];
                        map.setView(userCoords, 14);
                        
                        // Añadir marcador para la ubicación del usuario
                        L.marker(userCoords, {
                            icon: L.divIcon({
                                html: '<div style="background-color: #f39c12; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"></div>',
                                className: 'user-marker',
                                iconSize: [20, 20],
                                iconAnchor: [10, 20]
                            })
                        })
                        .addTo(map)
                        .bindPopup('Tu ubicación actual')
                        .openPopup();
                    },
                    (error) => {
                        alert('No se pudo obtener tu ubicación. Asegúrate de que los permisos de ubicación estén activados.');
                        console.error('Error obteniendo ubicación:', error);
                    }
                );
            } else {
                alert('Tu navegador no soporta la geolocalización.');
            }
        });
    }
    
    // Botón "Vista general"
    const btnResetView = document.getElementById('btn-reset-view');
    if (btnResetView) {
        btnResetView.addEventListener('click', () => {
            // Ajustar la vista para mostrar todos los marcadores
            const group = new L.featureGroup(markers);
            map.fitBounds(group.getBounds().pad(0.1));
            
            // Cerrar todos los popups
            markers.forEach(marker => {
                marker.closePopup();
            });
            
            // Quitar la selección de sede activa
            document.querySelectorAll('.location-item').forEach(item => {
                item.classList.remove('active');
            });
        });
    }
}

// Redimensionar el mapa cuando cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 200);
    }
});