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
        proxima.addEventListener('click', () => {
            if (trilho.scrollLeft >= fim() - 1) {
                trilho.scrollTo({ left: 0 });
            } else {
                trilho.scrollBy({ left: passo() });
            }
        });

        anterior.addEventListener('click', () => {
            if (trilho.scrollLeft <= 1) {
                trilho.scrollTo({ left: fim() });
            } else {
                trilho.scrollBy({ left: -passo() });
            }
        });
    });
})();
