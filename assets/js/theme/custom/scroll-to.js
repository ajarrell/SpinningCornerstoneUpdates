import $ from 'jquery';

const getTopVal = e => {
    const id = $(e.currentTarget).data('scroll-to');
    const scrollTo = $(`#${id}`);
    let top = 0;

    if (scrollTo && scrollTo.children().length > 0) {
        top = scrollTo.offset().top;
    }

    return top - 82; // Account for sticky header height
};

const scroll = topVal => {
    $('html, body').animate({
        scrollTop: topVal
    });
};

$('[data-scroll-to]').off('click').on('click', e => {
    e.preventDefault();
    scroll(getTopVal(e));
});

if ($(window).width < 768) {
    $('[data-scroll-to-mobile]').off('touchstart').on('touchstart', e => {
        e.preventDefault();
        scroll(getTopVal(e));
    });
}
