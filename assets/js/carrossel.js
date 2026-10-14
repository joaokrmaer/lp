(function () {
    document.querySelectorAll('.js-carrossel').forEach((carrossel) => {
        const trilho = carrossel.querySelector('.js-trilho');
        const anterior = carrossel.querySelector('.js-anterior');
        const proxima = carrossel.querySelector('.js-proxima');

        // cada clique anda uma foto: a largura do slide mais o espaço entre eles
        function passo() {
            const slide = trilho.querySelector('.slide');
            const espaco = parseFloat(getComputedStyle(trilho).columnGap) || 0;
            return slide ? slide.offsetWidth + espaco : trilho.clientWidth;
        }

        function fim() {
            return trilho.scrollWidth - trilho.clientWidth;
        }

        // nas pontas dá a volta: depois da última vem a primeira, e vice-versa
        function avancar() {
            if (trilho.scrollLeft >= fim() - 1) {
                trilho.scrollTo({ left: 0 });
            } else {
                trilho.scrollBy({ left: passo() });
            }
        }

        function voltar() {
            if (trilho.scrollLeft <= 1) {
                trilho.scrollTo({ left: fim() });
            } else {
                trilho.scrollBy({ left: -passo() });
            }
        }

        // Passa sozinho a cada INTERVALO, mas só quando ninguém está mexendo nele
        // (mouse em cima, dedo arrastando, foco nas setas), quando ele está na tela
        // e quando a aba está aberta. Quem pede menos animação no sistema não ganha
        // o automático.
        const INTERVALO = 4000;
        const automatico = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let mexendo = false;
        let naTela = !('IntersectionObserver' in window);
        let relogio = null;

        function reiniciar() {
            clearInterval(relogio);
            if (!automatico) return;
            relogio = setInterval(() => {
                if (!mexendo && naTela && !document.hidden && !document.body.classList.contains('lightbox-aberto')) {
                    avancar();
                }
            }, INTERVALO);
        }

        // clique na seta conta como interação: o próximo passo automático espera
        // o intervalo inteiro em vez de pular logo em seguida
        proxima.addEventListener('click', () => { avancar(); reiniciar(); });
        anterior.addEventListener('click', () => { voltar(); reiniciar(); });

        carrossel.addEventListener('mouseenter', () => { mexendo = true; });
        carrossel.addEventListener('mouseleave', () => { mexendo = false; reiniciar(); });
        carrossel.addEventListener('focusin', () => { mexendo = true; });
        carrossel.addEventListener('focusout', () => { mexendo = false; reiniciar(); });
        trilho.addEventListener('touchstart', () => { mexendo = true; }, { passive: true });
        trilho.addEventListener('touchend', () => { mexendo = false; reiniciar(); }, { passive: true });

        if (!naTela) {
            new IntersectionObserver(([entrada]) => {
                naTela = entrada.isIntersecting;
            }, { threshold: 0.3 }).observe(carrossel);
        }

        reiniciar();
    });

    // Foto ampliada: clique numa foto do carrossel abre a imagem grande, com setas,
    // teclado (← → Esc) e contador. Passa em volta nas pontas, como o carrossel.
    const lightbox = document.querySelector('.js-lightbox');
    if (lightbox) {
        const botoes = [...document.querySelectorAll('.js-abrir-foto')];
        const fotos = botoes.map((bt) => bt.querySelector('img'));
        const imagem = lightbox.querySelector('.js-lb-foto');
        const contador = lightbox.querySelector('.js-lb-contador');
        let atual = 0;
        let origem = null;

        function mostrar(indice) {
            atual = (indice + fotos.length) % fotos.length;
            imagem.src = fotos[atual].currentSrc || fotos[atual].src;
            imagem.alt = fotos[atual].alt;
            contador.textContent = (atual + 1) + ' de ' + fotos.length;
        }

        function abrirFoto(indice) {
            origem = document.activeElement;
            mostrar(indice);
            lightbox.hidden = false;
            document.body.classList.add('lightbox-aberto');
            document.body.style.overflow = 'hidden';
            lightbox.querySelector('.js-lb-fechar').focus();
        }

        function fecharFoto() {
            lightbox.hidden = true;
            document.body.classList.remove('lightbox-aberto');
            document.body.style.overflow = '';
            if (origem) origem.focus({ preventScroll: true });
        }

        botoes.forEach((bt, i) => bt.addEventListener('click', () => abrirFoto(i)));
        lightbox.querySelector('.js-lb-anterior').addEventListener('click', () => mostrar(atual - 1));
        lightbox.querySelector('.js-lb-proxima').addEventListener('click', () => mostrar(atual + 1));
        lightbox.querySelector('.js-lb-fechar').addEventListener('click', fecharFoto);

        // clique no fundo escuro fecha; na foto ou nos botões, não
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) fecharFoto();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.hidden) return;
            if (e.key === 'Escape') fecharFoto();
            if (e.key === 'ArrowLeft') mostrar(atual - 1);
            if (e.key === 'ArrowRight') mostrar(atual + 1);
        });
    }

    // vídeo do evento toca mudo sozinho só enquanto está à vista, e pausa ao sair
    // dela; como o preload é "none", nada é baixado até alguém chegar nele
    const videos = document.querySelectorAll('.js-video-auto');
    if (!videos.length || !('IntersectionObserver' in window)) return;

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) {
                target.play().catch(() => {});
            } else {
                target.pause();
            }
        });
    }, { threshold: 0.6 });

    videos.forEach((video) => observador.observe(video));
})();
