/*
 Import all product specific js
 */
import $ from 'jquery';
import PageManager from '../page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';
import { createElement, has, hasLength, isObject } from './custom/util';
import { parallel } from 'async';

let product = {};
let warranty = {};

export default class Product extends PageManager {
    constructor() {
        super();
        this.url = location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        if ($('.workshop-detail').length != 0) {
            this.createTrainingPage();
        }
        this.getShortDescription();
        this.getLongDescription();
        this.getBenefits();
        this.getSpecs();
        //this.getWhySpinning();
        this.getProductComparison();
        this.getShippingDetails();
        this.hideOptions();
        this.hideManual();
        $('.long-tabs--tab').first().addClass('is-active');
        $('.long-tabs--content').first().addClass('is-active');
        $('.long-tabs--tab').last().addClass('is-active');
        $('.long-tabs--content').last().addClass('is-active');
        this.googleTagManagerProduct();
    }

    before(next) {
        product = this.context.product;
        
        if (isObject(product.warranty)) {
            warranty = $.parseJSON(product.warranty);
        }

        // Slick the product image slider
        $('.productView-thumbnails').slick({
            slidesToShow: 4,
            prevArrow: '<i class="fa fa-angle-up"></i>',
            nextArrow: '<i class="fa fa-angle-down"></i>',
            dots: false,
            arrows: true,
            vertical: true
        });

        // Create the accordion tabs/content at the bottom based on what's provided in
        // the warranty information.
        this.createWarrantyTabs(warranty);


        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#writeReview') !== -1) {
                History.replaceState('', document.title, window.location.pathname);
            }
        });

        next();
    }

    loaded(next) {
        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context);

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation();
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });
        
        this.handleSubscriptionPage();
        
        next();
    }

    after(next) {
        this.productReviewHandler();

        next();
    }

    handleSubscriptionPage() {
        if (this.context.product.url.indexOf('/spin-membership-e-kit/') > -1) {
            var pickLists = $('[data-product-attribute="product-list"]');

			if (pickLists.length > 0) {
                pickLists.each((i, pickList) => {
                    this.pickListToDropdown($(pickList));
                });
				
				this.showAllDropdowns();
			}
        }
    }
    
    googleTagManagerProduct() {
        var productName = $('.productView-title').text();
        var productId = $('#product-id').text();
        var categoryName = $('.breadcrumb.is-active').prev().find('a').first().text();
        dataLayer.push({
            'ecommerce': {
                'detail': {
                    'products': [{
                        'name': productName,
                        'id': productId,
                        'brand': 'spinning',
                        'category': categoryName
                    }]
                }
            }
        });

        $('#form-action-addToCart').on('click', function(){
            dataLayer.push({
                'prod id': productId, 
                'category': categoryName, 
                'prod name': productName,
                'event':'addedtocart'
            });
        })
    }

    productReviewHandler() {
        if (this.url.indexOf('#writeReview') !== -1) {
            this.$reviewLink.click();
        }
    }

    createWarrantyTabs(warranty) {
        parallel([
            cb => {
                if (has(warranty, 'features') && hasLength(warranty.features)) {
                    this._createWarrantyTab('Features', warranty.features);
                }
                cb(null);
            },
            cb => {
                if (has(warranty, 'shipping_notes') && hasLength(warranty.shipping_notes)) {
                    this._createWarrantyTab('Shipping Notes', warranty.shipping_notes);
                }
                cb(null);
            },
            cb => {
                if (has(warranty, 'specs') && hasLength(warranty.specs)) {
                    this._createWarrantyTab('Specs', warranty.specs);
                }
                cb(null);
            },
            cb => {
                if (has(warranty, 'why_spinning') && hasLength(warranty.why_spinning)) {
                    this._createWarrantyTab('Why Spinning?', warranty.why_spinning);
                }
                cb(null);
            },
            cb => {
                if (has(warranty, 'product_comparison') && hasLength(warranty.product_comparison)) {
                    this._createWarrantyTab('Product Comparison', warranty.product_comparison);
                }
                cb(null);
            },
            cb => {
                if (has(warranty, 'benefits') && hasLength(warranty.benefits)) {
                    let wrapper = this._createWarrantyTab('Benefits', warranty.benefits, true);

                    wrapper.find('.warranty-benefits--slider').slick({
                        slidesToShow: 1,
                        autoplay: true,
                        dots: true,
                        arrows: false,
                        infinite: false,
                        vertical: true
                    });
                }
                cb(null);
            }
        ], (err, res) => {
            // Handle callback with 'err' as any error thrown, and 'res' as array of return values of each
            // function that was called.
        });
    }

    _createWarrantyTab(title, content, contentNoPadding) {
        var contentMarkup = $('<div />').html(content).text();
        console.log(content);
        let wrapper = $('.long-tabs--wrapper'),
            icon = createElement('i', {
                class: 'fa fa-times-circle-o'
            }),
            span = createElement('span', {
                innerText: title
            }),
            tabTitle = createElement('div', {
                class: 'long-tabs--tab'
            }, icon, span),
            tabContent = createElement('div', {
                class: contentNoPadding ? 'long-tabs--content nopadding' : 'long-tabs--content',
                innerHTML: contentMarkup
            });

            $(tabTitle).insertBefore('.review-tab-title');
            $(tabContent).insertBefore('.review-tab-title');

        //wrapper.append(tabTitle).append(tabContent);

        return wrapper;
    }

    getShortDescription() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.short != null) {
            if (hasLength(data.short)) {
                $('.description').text(data.short);
            }
        }
    }

    getLongDescription() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.description != null) {
            if (hasLength(data.description)) {
                if (data.description != "") {
                    this._createWarrantyTab('Description', data.description);
                }
            }
        }
    }

    getSpecs() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.specs != null) {
            if (hasLength(data.specs)) {
                if (data.specs != "") {
                    this._createWarrantyTab('Features and Specifications', data.specs);
                }
            }
        }
    }

    getWhySpinning() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (hasLength(data.why_spinning)) {
            this._createWarrantyTab('Why Spinning?', data.why_spinning);
        }
    }

    getShippingDetails() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.shipping_notes != null) {
            if (hasLength(data.shipping_notes)) {
                if (data.shipping_notes != "") {
                    this._createWarrantyTab('Shipping Details', data.shipping_notes);
                }
            }
        }
    }

    getProductComparison() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.product_comparison != null) {
            if (hasLength(data.product_comparison)) {
                if (data.product_comparison != "") {
                    this._createWarrantyTab('Product Comparison', data.product_comparison);
                }
            }
        }
    }

    hideOptions() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.show_options != null) {
            if (data.show_options == false) {
                $('.productView-options .col-sm-6').hide();
            }
        }
    }

    hideManual() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (data.manual != null) {
            if (data.manual == false) {
                $('.price-block .item').hide();
            } else {
                if (data.manual_text != null) {
                    var manualText = $('<div />').html(data.manual_text).text();
                    $('.price-block .item').text(manualText);
                }
            }
        }
    }

    getBenefits() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        if (hasLength(data.benefits)) {
            if (data.benefits != "") {
                let wrapper = this._createWarrantyTab('Benefits', data.benefits);
                wrapper.find('.warranty-benefits--slider').slick({
                    slidesToShow: 1,
                    autoplay: true,
                    dots: true,
                    arrows: false,
                    infinite: false,
                    vertical: true
                });
                $('#warranty-benefits').parent().css({"padding": "0"});
                $('#warranty-benefits').parent().addClass('is-active');
                $('#warranty-benefits').parent().prev().addClass('is-active');
            }
        }
    }

    createTrainingPage() {
        var response = $('#productJSON').html();
        let data = $.parseJSON(response);
        console.log(data);

        if (data.description != null) {
            if (data.description != "") {
                var descriptionMarkup = $('<div />').html(data.description).text();
                $('.body-content .description').html(descriptionMarkup);
            }
        }

        if (data.date != null) {
            if (data.date != "") {
                $('.date-formatted').text(data.date);
            }
        }

        if (data.benefits != null) {
            if (data.benefits != "") {
                var benefitsMarkup = $('<div />').html(data.benefits).text();
                $('.benefits-block').html(benefitsMarkup);
            } else {
                $('.benefits-block').html('');
            }
        } else {
            $('.benefits-block').html('');
        }

        if (data.contact_number != null) {
            if (data.contact_number != "") {
                var contactMarkup = 'Master Instructor:<br/>' + data.contact_number;
                $('.contact-info').html(contactMarkup);
            }
        }

        if ((data.start_time != null) && (data.end_time != null)) {
            if ((data.start_time != "") && (data.end_time != null)) {
                var timeMarkup = data.start_time + '–' + data.end_time;
                $('.time').text(timeMarkup);
            }
        }

        if (data.timezone != null) {
            if (data.timezone != "") {
                var timezoneMarkup = data.timezone;
                $('.timezone').text(timezoneMarkup);
            }
        }

        if (data.location_time != null) {
            if (data.location_time != "") {
                var locationMarkup = $('<div />').html(data.location_time).text();
                $('.location-block').html(locationMarkup);
                if ($('.training-title').text() == 'Online Learning') {
                    console.log('its online!!');
                    $('.workshop-detail').addClass('online');
                }
            } else {
                $('.location-block').html('');
            }
        } else {
            $('.location-block').html('');
        }

        if (data.red_bar != null) {
            if (data.red_bar != "") {
                $('.training-heading').text(data.red_bar);
            }
        }

        if (data.location != null) {
            if (data.location != "") {
                var mapMarkup = '<iframe width="300" height="300" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD5JpUddD2-esTr59CVEZN5j4XexqhFb0w&q='+data.location+'" allowfullscreen></iframe>';
                $('.map').html(mapMarkup);
            } else {
                $('.map').html('');
            }
        } else {
            $('.map').html('');
        }
    }
    
    showAllDropdowns() {
		var wrapper = $('.productView-options .form-field[data-product-attribute="set-select"]');
        wrapper.parent('div').show();
        wrapper.find('.form-label').css({'display': 'block', 'opacity': 1, 'width': 'auto', 'height': 'auto', 'visibility': 'visible'});
	}
    
    pickListToDropdown(pickList) {
		var wrapper = $('<div class="form-field" data-product-attribute="set-select" />');
		pickList.children('.form-label:first').appendTo(wrapper);

		var select = $('<select class="form-select form-select--small" />');
		var items = $('.form-radio', pickList);

		var item, valueText, valueId, attributeName;

		for (var i = 0; i < items.length; i++) {
			item = $(items[i]);
			valueId = item.attr('value');
			valueText = item.next('.form-label').text();

            if (valueId === '' || valueId === '0') {
                continue;
            }
            
			$('<option value="' + valueId + '" data-product-attribute-value="' + valueId + '">' + valueText + '</option>').appendTo(select);

			if (!attributeName) {
				attributeName = item.attr('name');
			}
		}

		var attributeId = attributeName.replace(']', '').replace('[', '_');
		$('.form-label', wrapper).attr('for', attributeId);

		select.attr('id', attributeId).attr('name', attributeName).appendTo(wrapper);
		wrapper.insertBefore(pickList);
		pickList.remove();
	}
}
