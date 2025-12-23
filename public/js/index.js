document.addEventListener('DOMContentLoaded', function() {
    const headerDinamico = document.getElementById('headerDinamico');
    
    if (headerDinamico) {
        fetch('_header.html')
            .then(response => response.text())
            .then(data => {
                headerDinamico.innerHTML = data;
                setActiveNavLink();
            })
            .catch(error => console.error('Error al cargar el encabezado:', error));
    }

    const footerDinamico = document.getElementById('footerDinamico');
    
    if (footerDinamico) {
        fetch('_footer.html')
            .then(response => response.text())
            .then(data => {
                footerDinamico.innerHTML = data;
                document.getElementById('year').textContent = new Date().getFullYear();
            })
            .catch(error => console.error('Error al cargar el pie de página:', error));
    }

    function setActiveNavLink () {
        // Obtener el nombre del archivo actual, o 'index.html' si es la raíz
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Comparamos el href del link con la página actual
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // Saludo dinámico (si existe el elemento en la página)
    const greetingElement = document.getElementById('greeting');
    if (greetingElement) {
        const hour = new Date().getHours();
        let greetingText = 'Bienvenido';
        
        if (hour < 12) greetingText = 'Buenos días';
        else if (hour < 18) greetingText = 'Buenas tardes';
        else greetingText = 'Buenas noches';
        
        greetingElement.textContent = `${greetingText}, Usuario`;
    }
});