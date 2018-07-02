import $ from 'jquery';

$(document).on('click', '.long-tabs .long-tabs--tab', e => {
    let el = $(e.currentTarget);
    let elContent = el.next('.long-tabs--content');

    if (el.hasClass('is-active') && elContent.hasClass('is-active')) {
        elContent.slideUp(150);
        elContent.removeClass('is-active');
        el.removeClass('is-active');
    } else {
        elContent.slideDown(150);
        elContent.addClass('is-active');
        el.addClass('is-active');
    }
});
