document.addEventListener('DOMContentLoaded', function() {
    // Seleciona os elementos do menu mobile
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    // Verifica se os elementos existem
    if(mobileMenuBtn && mainNav) {
        const menuIcon = mobileMenuBtn.querySelector('i');
        
        // Função para abrir/fechar o menu
        function toggleMenu() {
            const isOpen = mainNav.classList.contains('active');
            
            // Alterna o estado do menu
            mainNav.classList.toggle('active');
            document.body.style.overflow = isOpen ? '' : 'hidden';
            
            // Alterna o ícone
            if(menuIcon) {
                menuIcon.classList.toggle('fa-bars');
                menuIcon.classList.toggle('fa-times');
            }
        }
        
        // Evento de clique no botão - Versão reforçada
        mobileMenuBtn.addEventListener('click', function(e) {
            console.log('Botão clicado!'); // Verificação no console
            
            // Impede comportamentos padrão
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Chama a função de toggle
            toggleMenu();
            
            // Verificação adicional
            console.log('Estado do menu:', mainNav.classList.contains('active') ? 'Aberto' : 'Fechado');
        }, true); // Usando capture phase para garantir execução
        
        // Fecha o menu ao clicar nos links
        document.querySelectorAll('.main-nav a').forEach(link => {
            link.addEventListener('click', () => {
                if(mainNav.classList.contains('active')) {
                    toggleMenu();
                }
            });
        });
        
        // Fecha o menu ao clicar fora
        document.addEventListener('click', function(e) {
            if(mainNav.classList.contains('active') && 
               !e.target.closest('.main-nav') && 
               !e.target.closest('.mobile-menu-btn')) {
                toggleMenu();
            }
        });
        
        // Fecha o menu ao redimensionar para desktop
        window.addEventListener('resize', function() {
            if(window.innerWidth > 768 && mainNav.classList.contains('active')) {
                toggleMenu();
            }
        });
    } else {
        console.error('Elementos do menu não encontrados:', {
            button: mobileMenuBtn,
            nav: mainNav
        });
    }

    // [Mantenha o restante do seu código JavaScript aqui]
    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            if(this.getAttribute('href') === '#') return;
            
            const target = document.querySelector(this.getAttribute('href'));
            if(target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Testimonial Slider
    const testimonials = document.querySelectorAll('.testimonial');
    const prevBtn = document.querySelector('.slider-controls .prev');
    const nextBtn = document.querySelector('.slider-controls .next');
    let currentTestimonial = 0;
    
    function showTestimonial(index) {
        testimonials.forEach(testimonial => {
            testimonial.classList.remove('active');
        });
        
        testimonials[index].classList.add('active');
        currentTestimonial = index;
    }
    
    if(testimonials.length > 0) {
        showTestimonial(0);
        
        nextBtn.addEventListener('click', function() {
            let nextIndex = currentTestimonial + 1;
            if(nextIndex >= testimonials.length) {
                nextIndex = 0;
            }
            showTestimonial(nextIndex);
        });
        
        prevBtn.addEventListener('click', function() {
            let prevIndex = currentTestimonial - 1;
            if(prevIndex < 0) {
                prevIndex = testimonials.length - 1;
            }
            showTestimonial(prevIndex);
        });
        
        setInterval(function() {
            let nextIndex = currentTestimonial + 1;
            if(nextIndex >= testimonials.length) {
                nextIndex = 0;
            }
            showTestimonial(nextIndex);
        }, 5000);
    }
    
    // Modal functionality
    const readMoreLinks = document.querySelectorAll('.read-more');
    
    readMoreLinks.forEach((link, index) => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = `modal-${index + 1}`;
            const modal = document.getElementById(modalId);
            
            if (modal) {
                modal.style.display = "block";
                document.body.classList.add('no-scroll');
                
                const closeBtn = modal.querySelector('.close-modal');
                closeBtn.onclick = function() {
                    modal.style.display = "none";
                    document.body.classList.remove('no-scroll');
                }
                
                window.onclick = function(event) {
                    if (event.target == modal) {
                        modal.style.display = "none";
                        document.body.classList.remove('no-scroll');
                    }
                }
            }
        });
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.style.display = "none";
                document.body.classList.remove('no-scroll');
            });
        }
    });
    
    // Sticky Header on Scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if(window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
    
    if(window.scrollY > 100) {
        document.querySelector('.header').classList.add('sticky');
    }

    // Form Submission
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value.trim(),
                date: new Date().toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            emailjs.send('service_ivte3gm', 'template_3mmwq2j', formData)
                .then(function(response) {
                    console.log('EmailJS SUCCESS:', response);
                    sendFormSubmit(formData);
                })
                .catch(function(error) {
                    console.error('EmailJS FAILED:', error);
                    sendFormSubmit(formData, true);
                });

            function sendFormSubmit(formData, isFallback = false) {
                const formSubmitUrl = 'https://formsubmit.co/ajax/matheusrprado@hotmail.com';
                
                fetch(formSubmitUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(formData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log('FormSubmit success:', data);
                    showMessage(
                        isFallback 
                            ? 'Mensagem enviada via sistema alternativo! Entraremos em contato em breve.' 
                            : 'Mensagem enviada com sucesso!',
                        'success'
                    );
                    contactForm.reset();
                })
                .catch(error => {
                    console.error('FormSubmit error:', error);
                    showMessage(
                        'Erro ao enviar. Por favor, nos chame no WhatsApp: (13) 98180-4959',
                        'error'
                    );
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                });
            }

            function showMessage(text, type = 'success') {
                formMessage.textContent = text;
                formMessage.style.display = 'block';
                formMessage.style.backgroundColor = type === 'success' ? '#4CAF50' : '#f44336';
                formMessage.style.padding = '15px';
                formMessage.style.borderRadius = '5px';
                formMessage.style.marginTop = '20px';
                formMessage.style.textAlign = 'center';
                
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }
        });
    }
});