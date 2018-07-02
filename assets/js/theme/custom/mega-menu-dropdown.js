import $ from 'jquery';

if ($(window).width() >= 1200) {
    desktopMegaMenuFunctionality();
} else if ($(window).width() < 1200) {
    mobileMegaMenuFunctionality();
}

$(window).on('resize', function(){
    $('.navPages-list .navPages-item.has-child-menu').unbind();
    if ($(window).width() >= 1200) {
        desktopMegaMenuFunctionality();
    } else if ($(window).width() < 1200) {
        mobileMegaMenuFunctionality();
    }
})


function desktopMegaMenuFunctionality() {
    // These are the first level menu links on the top level header
    const firstLevelMenuLinksClass = '.navPages-list .navPages-item.has-child-menu';

    // This is the class representing the mega-menu dropdown container
    const megaMenuClass = '.dropdown.dropdown--megaMenu';


    $(firstLevelMenuLinksClass).on('mouseover', function(e) {
        e.preventDefault();

        let hoveredLink = $(e.currentTarget);
        let megaMenu = hoveredLink.closest('.header').find(megaMenuClass);

        let html = $(e.currentTarget).find('.second-level').html();

        // megaMenu.addClass('is-open');
        megaMenu.show();
        megaMenu.html(html);
        $('.navPages-item').removeClass('subactive');
        $(e.currentTarget).addClass('hovered subactive');

    }).mouseout(function(e) {
        // $('.dropdown--megaMenu').removeClass('is-open');
        $('.dropdown--megaMenu').hide();
        $(e.currentTarget).removeClass('hovered');
        // $(e.currentTarget).addClass('hovered');
    });

    $('.dropdown--megaMenu').on('mouseover', function(e) {
        $(this).show();
        $('.navPages-item.subactive').addClass('hovered');
    }).mouseout(function(e) {
        $(this).hide();
        $('.navPages-item.subactive').removeClass('hovered');
    });
}

function mobileMegaMenuFunctionality() {
    $('.navPages-item > .navPages-action > .fa').on('touchstart click', e => {
        e.preventDefault();

        let el = $(e.currentTarget);

        el.hide();

        if (el.hasClass('fa-angle-up')) {
            el.parent().find('.fa-angle-down').show();
            el.parent().next('.second-level').slideUp();
        } else {
            el.parent().find('.fa-angle-up').show();
            el.parent().next('.second-level').slideDown();
        }
    });
}
