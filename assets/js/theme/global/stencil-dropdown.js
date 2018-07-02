import $ from 'jquery';

export default class StencilDropdown {
    constructor(extendables) {
        this.extendables = extendables;
    }

    /**
     * @param $dropDown
     * @param style
     */
    hide($dropDown, style) {
        if (style) {
            $dropDown.attr('style', style);
        }

        // callback "hide"
        if (this.extendables && this.extendables.hide) {
            this.extendables.hide(event);
        }

        // Show the navigation menu that was hidden to provide place for the search dropdown
        $dropDown.prev().removeClass('search-open');

        $dropDown.removeClass('is-open f-open-dropdown').attr('aria-hidden', 'true');
    }

    show($dropDown, event, style) {
        event.preventDefault();

        if (style) {
            $dropDown.attr('style', style).attr('aria-hidden', 'false');
        }

        // Hide the navigation menu to provide space for the search dropdown
        if ($dropDown.hasClass('dropdown--quickSearch')) {
            $dropDown.prev().addClass('search-open');
        }

        $dropDown.addClass('is-open f-open-dropdown').attr('aria-hidden', 'false');

        // callback "show"
        if (this.extendables && this.extendables.show) {
            this.extendables.show(event);
        }
    }

    bind($dropDownTrigger, $container, style) {
        let modalOpened = false;

        $dropDownTrigger.on('click', (event) => {
            const $cart = $('.is-open[data-cart-preview]');

            if ($cart) {
                $cart.click();
            }

            if ($container.hasClass('is-open')) {
                this.hide($container, event);
            } else {
                this.show($container, event, style);
            }
        });

        $('body').click((e) => {
            // Call onClick handler
            if (this.extendables && this.extendables.onBodyClick) {
                this.extendables.onBodyClick(e, $container);
            }
        }).on('keyup', (e) => {
            // If they hit escape and the modal isn't open, close the search
            if (e.which === 27 && !modalOpened) {
                this.hide($container);
            }
        }).on('open.fndtn.reveal', '[data-reveal]', () => {
            modalOpened = true;
        }).on('close.fndtn.reveal', '[data-reveal]', () => {
            modalOpened = false;
        }).on('click', '[data-drop-down-close]', () => {
            modalOpened = false;
            this.hide($container);
        });
    }
}
