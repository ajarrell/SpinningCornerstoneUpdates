import $ from 'jquery';

const slickOpts = {
    slidesToShow: 1,
    arrows: false,
    autoplay: true,
    dots: true,
    speed: 1000
};

const slickOptsTestimonials = {
    accessibility: false,
    draggable: false,
    swipe: false,
    touchMove: false,
    slidesToShow: 1,
    arrows: false,
    autoplay: false,
    dots: false,
    speed: 1000
};

const slickOptsVertical = {
    slidesToShow: 1,
    arrows: false,
    autoplay: true,
    dots: true,
    vertical: true,
    verticalSwiping: true,
    speed: 1000
}

// Slick each slider on the page
$('.tabbed-z--slider:not(.our-fans-slider)').slick(slickOpts);

$('.tabbed-z--slider.our-fans-slider').slick(slickOptsTestimonials);

$('.slider-container .slick-slider').slick(slickOptsVertical);

/**
 * Toggle testimonials section quotes on each slide
 */

$('.tabbed-z--slider.our-fans-slider').on('afterChange', (e, slick, currentSlideNum) => {
    let html = $(slick.$slides[currentSlideNum]).find('img').data('content');
    let parentZ = $(e.currentTarget).closest('.tabbed-z');

    parentZ.find('.tabbed-z--content.alone').html(html);
});

$(document).on('click', '.tabbed-z [data-toggle]', e => {
    e.preventDefault();

    let clickedTab = $(e.currentTarget);
    let id = clickedTab.data('toggle');
    let parentZ = clickedTab.closest('.tabbed-z');

    /**
     * Toggle tabs
     */

    // Remove 'active' class from previously active tab menu item
    parentZ.find('[data-toggle]').parent('.active').removeClass('active');

    // Add 'active' class to clicked tab menu item
    clickedTab.parent().addClass('active');

    /**
     * Toggle pages
     */

    // Remove 'active' class from the currently active page
    parentZ.find('.tabbed-z--page.active').removeClass('active');

    // Add 'active' class to page with id matching the id of the selected tab
    parentZ.find(`.tabbed-z--page[data-toggled-by="${id}"]`).addClass('active');

    /**
     * Toggle slicked content
     */

    // Unslick the currently active active pages' slider
    parentZ.find('.tabbed-z--page.active ul.tabbed-z--slider').slick('unslick');
    parentZ.find('.tabbed-z--page.active ul.tabbed-z--slider').removeClass('tabbed-z--slider');

    // Slick the soon to be activated pages' slider
    parentZ.find(`.tabbed-z--page[data-toggled-by="${id}"] ul:not(.tabbed-z--ignore)`).addClass('tabbed-z--slider');
    parentZ.find(`.tabbed-z--page[data-toggled-by="${id}"] ul:not(.tabbed-z--ignore)`).slick(slickOpts);
});
