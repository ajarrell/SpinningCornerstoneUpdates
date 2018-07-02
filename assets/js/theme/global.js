import $ from 'jquery';
import './common/select-option-plugin';
import 'history.js/scripts/bundled-uncompressed/html4+html5/jquery.history';
import PageManager from '../page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import compareProducts from './global/compare-products';
import privacyCookieNotification from './global/cookieNotification';
import maintenanceMode from './global/maintenanceMode';
import carousel from './common/carousel';
import loadingProgressBar from './global/loading-progress-bar';
import FastClick from 'fastclick';
import './custom/select2';

function fastClick(element) {
    return new FastClick(element);
}

function workshopSearchInit() {

    $('.refine-results select').select2({
        minimumResultsForSearch: Infinity
    });


    $('#workshop-type').on('change', function(){
        console.log("no");
        if ($(this).val() == "78") {
            console.log("yes");
            $('#location-value').prop("disabled", true).addClass("disabled");
        } else {
            $('#location-value').prop("disabled", false).removeClass("disabled");
        }
    });

    if (/instructorcertification/.test(window.location.href)) {
        $('#workshop-type').val("76").trigger("change");
    }

    if (/continuingeducation/.test(window.location.href)) {
        $('#workshop-type').val("77").trigger("change");
    }

    if (/onlinelearning/.test(window.location.href)) {
        $('#workshop-type').val("78").trigger("change");
        $('.refine-results input[type="submit"]').click();
    }

    $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCjTtTeq2kX9oi85_MNmFlEkvR_ravOpf8&libraries=places", function(){
        var input = document.getElementById('location-value');
        if (input) {
            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.setOptions({types: ["geocode"]});
        }
    });

}

export default class Global extends PageManager {
    /**
     * You can wrap the execution in this method with an asynchronous function map using the async library
     * if your global modules need async callback handling.
     * @param next
     */
    loaded(next) {
        //fastClick(document.body);
        workshopSearchInit();
        quickSearch();
        currencySelector();
        foundation($(document));
        quickView(this.context);
        cartPreview();
        compareProducts(this.context.urls);
        carousel();
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        maintenanceMode(this.context.maintenanceMode);
        //loadingProgressBar();

        $('.card .card-title').matchHeight();
        $('.card .card-image').matchHeight();
        $('.card .card-text').matchHeight();
        $('.card .card-body').matchHeight();

        $('.shop-promo').slick({
            arrows: true
        });

        next();
    }
}
