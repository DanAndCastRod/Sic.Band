document.addEventListener('DOMContentLoaded', function() {
    // Función para manejar el menú responsive
    const handleResponsiveMenu = () => {
        const navLinks = document.querySelector('.nav-links');
        if (window.innerWidth < 768) {
            navLinks.style.display = 'none';
        } else {
            navLinks.style.display = 'flex';
        }
    };

    // Llamar a la función inicialmente y en cada cambio de tamaño de ventana
    handleResponsiveMenu();
    window.addEventListener('resize', handleResponsiveMenu);

    // Añadir funcionalidad a los botones (puedes expandir esto según sea necesario)
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botón clickeado:', this.textContent);
            // Aquí puedes añadir la funcionalidad específica para cada botón
        });
    });

    // Ejemplo de cómo podrías manejar la navegación (si tuvieras múltiples páginas)
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Navegando a:', this.textContent);
            // Aquí podrías implementar la navegación real si tuvieras múltiples páginas
        });
    });
});