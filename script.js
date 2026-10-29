/* =========================================================================
   Matheus Prado Advocacia
   Comportamento da pagina: menu, entrada dos elementos, modais e formulario.

   Tudo degrada com elegancia. Sem JavaScript, o conteudo continua visivel e
   o formulario envia pelo caminho normal.
   ========================================================================= */

(function () {
  'use strict';

  // Avisa ao CSS que o script rodou. Sem isso nada fica escondido esperando
  // uma animacao que nunca vai acontecer.
  document.documentElement.classList.add('js');

  var menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    anoAtual();
    menu();
    cabecalhoFixo();
    secaoAtual();
    revelar();
    modais();
    formulario();
  });

  /* ----------------------------------------------------------------- ano */
  function anoAtual() {
    var alvo = document.getElementById('ano');
    if (alvo) alvo.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------- menu */
  function menu() {
    var botao = document.querySelector('.menu-botao');
    var painel = document.getElementById('menu-principal');
    var fundo = document.querySelector('.menu-fundo');

    if (!botao || !painel || !fundo) return;

    var icone = botao.querySelector('use');

    function abrir() {
      // Tira o display:none antes de animar, senao a transicao nao acontece.
      painel.classList.remove('escondido');

      requestAnimationFrame(function () {
        painel.classList.add('aberto');
      });

      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar o menu');
      if (icone) icone.setAttribute('href', '#i-close');

      fundo.hidden = false;
      // Um quadro de espera para a transicao de opacidade pegar.
      requestAnimationFrame(function () {
        fundo.classList.add('visivel');
      });

      document.body.classList.add('travado');
    }

    function fechar() {
      painel.classList.remove('aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir o menu');
      if (icone) icone.setAttribute('href', '#i-menu');

      fundo.classList.remove('visivel');
      document.body.classList.remove('travado');

      window.setTimeout(function () {
        if (painel.classList.contains('aberto')) return;
        fundo.hidden = true;
        // So depois da animacao o painel sai do fluxo de vez.
        painel.classList.add('escondido');
      }, menosMovimento ? 0 : 240);
    }

    function alternar() {
      if (painel.classList.contains('aberto')) fechar();
      else abrir();
    }

    botao.addEventListener('click', alternar);
    fundo.addEventListener('click', fechar);

    painel.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) fechar();
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && painel.classList.contains('aberto')) {
        fechar();
        botao.focus();
      }
    });

    // Ao voltar para a largura de desktop o painel nao pode ficar preso.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && painel.classList.contains('aberto')) fechar();
    });
  }

  /* ----------------------------------------------------------- cabecalho */
  function cabecalhoFixo() {
    var cabecalho = document.getElementById('cabecalho');
    if (!cabecalho) return;

    function atualizar() {
      cabecalho.classList.toggle('fixado', window.scrollY > 24);
    }

    atualizar();
    window.addEventListener('scroll', atualizar, { passive: true });
  }

  /* ------------------------------------------------- secao atual no menu */
  function secaoAtual() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('.menu__lista a[href^="#"]')
    );
    if (links.length === 0 || !('IntersectionObserver' in window)) return;

    var porId = {};
    var secoes = [];

    links.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var secao = document.getElementById(id);
      if (!secao) return;
      porId[id] = link;
      secoes.push(secao);
    });

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          var link = porId[entrada.target.id];
          if (!link) return;

          if (entrada.isIntersecting) {
            links.forEach(function (outro) {
              outro.removeAttribute('aria-current');
            });
            link.setAttribute('aria-current', 'true');
          }
        });
      },
      // A faixa estreita no meio da tela evita que duas secoes disputem.
      { rootMargin: '-45% 0px -50% 0px' }
    );

    secoes.forEach(function (secao) {
      observador.observe(secao);
    });
  }

  /* ------------------------------------------- entrada dos elementos */
  function revelar() {
    var alvos = Array.prototype.slice.call(document.querySelectorAll('[data-revelar]'));
    if (alvos.length === 0) return;

    if (menosMovimento || !('IntersectionObserver' in window)) {
      alvos.forEach(function (alvo) {
        alvo.classList.add('revelado');
      });
      return;
    }

    var observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('revelado');
          observador.unobserve(entrada.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    alvos.forEach(function (alvo) {
      observador.observe(alvo);
    });
  }

  /* -------------------------------------------------------------- modais */
  function modais() {
    var gatilhos = Array.prototype.slice.call(document.querySelectorAll('[data-modal]'));
    if (gatilhos.length === 0) return;

    var aberto = null;
    var ultimoFoco = null;

    function abrir(modal, gatilho) {
      ultimoFoco = gatilho;
      aberto = modal;

      modal.hidden = false;
      requestAnimationFrame(function () {
        modal.classList.add('visivel');
      });

      document.body.classList.add('travado');

      var fechar = modal.querySelector('.modal__fechar');
      if (fechar) fechar.focus();
    }

    function fechar() {
      if (!aberto) return;

      var modal = aberto;
      aberto = null;

      modal.classList.remove('visivel');
      document.body.classList.remove('travado');

      window.setTimeout(
        function () {
          if (!modal.classList.contains('visivel')) modal.hidden = true;
        },
        menosMovimento ? 0 : 240
      );

      if (ultimoFoco) ultimoFoco.focus();
    }

    gatilhos.forEach(function (gatilho) {
      gatilho.addEventListener('click', function () {
        // O vinculo vem do atributo, nao da posicao do elemento na pagina.
        var modal = document.getElementById(gatilho.getAttribute('data-modal'));
        if (modal) abrir(modal, gatilho);
      });
    });

    document.querySelectorAll('.modal').forEach(function (modal) {
      var botao = modal.querySelector('.modal__fechar');
      if (botao) botao.addEventListener('click', fechar);

      // Clicar no fundo escuro fecha; clicar na caixa nao.
      modal.addEventListener('click', function (evento) {
        if (evento.target === modal) fechar();
      });
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && aberto) fechar();

      // Mantem o foco dentro do modal enquanto ele estiver aberto.
      if (evento.key === 'Tab' && aberto) {
        var focaveis = aberto.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focaveis.length === 0) return;

        var primeiro = focaveis[0];
        var ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    });
  }

  /* ---------------------------------------------------------- formulario */
  var EMAILJS_CHAVE = 'sN0qtc8S5ad9Qc8Yg';
  var EMAILJS_SERVICO = 'service_ivte3gm';
  var EMAILJS_MODELO = 'template_3mmwq2j';
  var DESTINO_RESERVA = 'https://formsubmit.co/ajax/matheusrprado@hotmail.com';

  function formulario() {
    var form = document.getElementById('formularioContato');
    var retorno = document.getElementById('retornoFormulario');

    if (!form || !retorno) return;

    var temEmailJs = typeof window.emailjs !== 'undefined';

    if (temEmailJs) {
      try {
        window.emailjs.init(EMAILJS_CHAVE);
      } catch (erro) {
        temEmailJs = false;
      }
    }

    function mostrar(texto, tipo) {
      retorno.textContent = texto;
      retorno.className = 'formulario__retorno ' + tipo;
      retorno.hidden = false;
    }

    form.addEventListener('submit', function (evento) {
      evento.preventDefault();

      // A marca libera o destaque vermelho dos campos vazios.
      form.classList.add('foi-validado');

      if (!form.checkValidity()) {
        var invalido = form.querySelector(':invalid');
        if (invalido) invalido.focus();
        mostrar('Preencha os campos obrigatórios antes de enviar.', 'erro');
        return;
      }

      var botao = form.querySelector('button[type="submit"]');
      var textoOriginal = botao ? botao.textContent : '';

      if (botao) {
        botao.disabled = true;
        botao.textContent = 'Enviando...';
      }

      var dados = {
        name: form.nome.value.trim(),
        email: form.email.value.trim(),
        phone: form.telefone.value.trim(),
        subject: form.assunto.value,
        message: form.mensagem.value.trim(),
        date: new Date().toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      function reserva() {
        return fetch(DESTINO_RESERVA, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(dados),
        }).then(function (resposta) {
          if (!resposta.ok) throw new Error('falha no envio');
          return resposta.json();
        });
      }

      var envio = temEmailJs
        ? window.emailjs
            .send(EMAILJS_SERVICO, EMAILJS_MODELO, dados)
            .catch(function () {
              // O EmailJS falhou. Tenta o caminho alternativo antes de desistir.
              return reserva();
            })
        : reserva();

      envio
        .then(function () {
          mostrar(
            'Mensagem enviada. Retornamos dentro do horário de atendimento.',
            'ok'
          );
          form.reset();
          form.classList.remove('foi-validado');
        })
        .catch(function () {
          mostrar(
            'Não foi possível enviar agora. Chame no WhatsApp: (13) 98180-4959.',
            'erro'
          );
        })
        .then(function () {
          if (botao) {
            botao.disabled = false;
            botao.textContent = textoOriginal;
          }
        });
    });
  }
})();
