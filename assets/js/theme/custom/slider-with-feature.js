import $ from 'jquery';

let slider = $('.slider-with-feature .slider-with-feature--slider');
let featuredImage = $('.slider-with-feature .slider-with-feature--featured-image');
let featuredTitle = $('.slider-with-feature .slider-with-feature--featured-title');
let featuredDescription = $('.slider-with-feature .slider-with-feature--featured-description');
let featuredLink = $('.slider-with-feature .slider-with-feature--featured-link');

slider.find('li').off('click').on('click', e => {
    e.preventDefault();

    shift(slider.find('img.active'), $(e.currentTarget));
});

slider.find('.fa').off('click').on('click', e => {
    e.preventDefault();

    let elem = $(e.currentTarget);
    let activeImage = slider.find('img.active');
    let prevLi = activeImage.parent().prev('li');
    let nextLi = activeImage.parent().next('li');

    // Add class to previous image if exists
    if (elem.hasClass('fa-arrow-circle-left')) {
        shift(activeImage, prevLi);
    }
    // Add 'active' class to next image if exists
    else if (elem.hasClass('fa-arrow-circle-right')) {
        shift(activeImage, nextLi);
    }
});

const shift = (activeImage, li) => {
    if (li.is('li')) {
        let prevImage = li.find('img');

        activeImage.removeClass('active');
        prevImage.addClass('active');

        featuredImage.attr('src', prevImage.attr('src'));
        featuredTitle.text(prevImage.data('featured-title'));
        featuredDescription.text(prevImage.data('featured-description'));
        featuredLink.attr('href', prevImage.data('featured-link'));
    } else {
        activeImage.addClass('shake');

        setTimeout(() => {
            activeImage.removeClass('shake');
        }, 350);
    }
};
