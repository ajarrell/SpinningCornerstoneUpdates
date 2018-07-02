import $ from 'jquery';

/*

function initOnScrollSticky (window) {
    const body = $('body');
    const header = $('.header');
    const fixedHeader = $('#fixed-header-container');
    if (fixedHeader.html().length <= 0) {
        fixedHeader.html(header.clone());
    }

    function onScroll() {
        let top = $(window).scrollTop();

        if (top === 0) {
            if (fixedHeader.hasClass('sticky')) {
                fixedHeader.removeClass('sticky').addClass('sticky-deactivated');
                $('.dropdown--megaMenu').css({'position':'absolute'});
                setTimeout(() => {
                    fixedHeader.removeClass('sticky-deactivated');
                }, 300);
            }
        } else if (top > 50 && !fixedHeader.hasClass('sticky')) {
            fixedHeader.addClass('sticky');
            $('.dropdown--megaMenu').removeClass('is-open');
            $('.dropdown--megaMenu').css({'position':'fixed'});
        }
    }

    if ($(window).width() >= 768) {
        $(window).scroll(onScroll);
    }
}

((window) => {
    initOnScrollSticky(window);
})(window);

*/
