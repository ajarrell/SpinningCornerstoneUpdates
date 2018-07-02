import $ from 'jquery';

(() => {
    $('.explore-boxes .explore-box').off('mouseenter touchstart').on('mouseenter touchstart', e => {
        let el = $(e.currentTarget);

        el.addClass('hovered');
    });

    $('.explore-boxes .explore-box').off('mouseleave touchend').on('mouseleave touchend', e => {
        let el = $(e.currentTarget);

        el.removeClass('hovered');
    });
})();
