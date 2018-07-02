import $ from 'jquery';

(() => {
    $('.footer .fa').click((e) => {
        $(e.currentTarget).hide();

        if ($(e.currentTarget).hasClass('fa-minus')) {
            $(e.currentTarget).parent().find('.fa-plus').show();

            $(`.footer-info-list[data-toggled-by="${$(e.currentTarget).data('toggle')}"]`).slideUp();
        } else if ($(e.currentTarget).hasClass('fa-plus')) {
            //$(e.currentTarget).parent().find('.fa-minus').show();
            $(e.currentTarget).parent().find('.fa-minus').css('display', 'block');

            $(`.footer-info-list[data-toggled-by="${$(e.currentTarget).data('toggle')}"]`).slideDown();
        }
    });
})();
