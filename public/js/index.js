document.addEventListener('DOMContentLoaded', function() {
    const headerDinamico = document.getElementById('headerDinamico');
    if (headerDinamico) {
        fetch('_header.html')
            .then(response =>{
                return response.text();
            })
            .then(data => {
                headerDinamico.innerHTML = data;
                setActiveNavLink();
            })
            .catch(error => console.error('Error al cargar el encabezado:', error));
    }

    function setActiveNavLink () {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
});