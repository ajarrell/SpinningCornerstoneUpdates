import { hooks } from '@bigcommerce/stencil-utils';
import CatalogPage from './catalog';
import $ from 'jquery';
import FacetedSearch from './common/faceted-search';
import { parallel } from 'async';
import { each, reduce } from './custom/util';

// The category object
let category;

// The custom HTML from the BC panel
let categoryHtml;

// This will be used to determine whether we are on a Category page,
// Category Apparel page or Subcategory page.
let context;

const CATEGORY = 'category';
const SUBCATEGORY = 'subcategory';
const CATEGORY_APPAREL = 'category-apparel';

export default class Category extends CatalogPage {
    constructor(props) {
        super(props);

        this.setAboveTheFoldContent = this.setAboveTheFoldContent.bind(this);
        this.setGradientContent = this.setGradientContent.bind(this);
        this.setZContent = this.setZContent.bind(this);
        this.setPromoContent = this.setPromoContent.bind(this);
        this.googleTagManagerCategory();
    }

    before(next) {
        category = this.context.category;
        categoryHtml = $('<div/>').append(category.description);
        context = this.context.context;
        parallel([
            cb => {
                if (context === CATEGORY) {
                    this.setAboveTheFoldContent(categoryHtml);
                } else if (context === SUBCATEGORY || context === CATEGORY_APPAREL) {
                    this.setAboveTheFoldContent(categoryHtml, true);
                }
                cb(null);
            },
            cb => {
                if (context === CATEGORY || context === CATEGORY_APPAREL) {
                    this.setGradientContent(categoryHtml);
                }
                cb(null);
            },
            cb => {
                this.setZContent(categoryHtml);
                cb(null);
            },
            cb => {
                if (context === CATEGORY || context === CATEGORY_APPAREL) {
                    this.setPromoContent(categoryHtml);
                }
                cb(null);
            }
        ], (err, res) => {
            if (err === null) {
                // Successfully set all custom HTML 
            } else {
                console.log('Error setting custom HTML:', err);
            }
        });

        next();
    }

    loaded() {
        if ($('#facetedSearch').length > 0) {
            this.initFacetedSearch();
        } else {
            this.onSortBySubmit = this.onSortBySubmit.bind(this);
            hooks.on('sortBy-submitted', this.onSortBySubmit);
        }
    }

    googleTagManagerCategory() {
        var gtm_products = [];
        var currency = $('#currency-code').text();
        var categoryName = $('.breadcrumb.is-active .breadcrumb-label').first().text();
        $('.productGrid .product').each(function(){
            var productName = $(this).find('.card-title a').first().text();
            var productId = $(this).find('.product-id').first().text();
            gtm_products.push({
                'name': productName,
                'id': productId,
                'list': categoryName,
                'category': categoryName
            });
        })
        dataLayer.push({
            'ecommerce': {
                'currencyCode': currency,                      
                'impressions': gtm_products
            }
        });
        $('.productGrid .product').on('click', function(){
            var clickedName = $(this).find('.card-title a').first().text();
            var clickedId = $(this).find('.product-id').first().text();
            dataLayer.push({
                'prod id': clickedId, 
                'category': categoryName, 
                'prod name': clickedName, 
                'event':'productclick'
            });
        })
    }

    setAboveTheFoldContent(html, ignoreCta) {
        let defaultCtaContainer = $('.cta-container'),
            customCtaContainer = html.find('.cta-container');

        // If the custom HTML is set, use it
        if (customCtaContainer.children().length > 0) {
            defaultCtaContainer.find('.cta-title')
                .text(customCtaContainer.find('.cta-title').text());

            defaultCtaContainer.find('.cta-description')
                .text(customCtaContainer.find('.cta-description').text());

            if (ignoreCta !== true) {
                let customCtaButton = html.find('.cta-button');

                defaultCtaContainer.find('.cta-button')
                    .text(customCtaButton.text())
                    .attr('href', customCtaButton.attr('href'));
            } else {
                //defaultCtaContainer.find('.cta-button').remove();
            }
        }
        // Else, remove the section since no content was provided for it
        else {
            //defaultCtaContainer.closest('.above-the-fold').remove();
        }
    }

    setGradientContent(html) {
        let defaultGradientContainer = $('.gradient'),
            defaultCols = defaultGradientContainer.find('.col-sm-3'),
            customGradientContainer = html.find('.gradient'),
            customCols = customGradientContainer.find('.col-sm-3');

        // If the custom HTML is set, use it
        if (customGradientContainer && customCols.length === 4) {
            each(defaultCols, (dCol, index) => {
                $(dCol).html($(customCols[index]).html());
            });
        }
        // Else, remove the section since no content was provided for it
        else {
            //defaultGradientContainer.remove();
        }
    }

    setZContent(html) {
        let defaultTabbedZ = $('.tabbed-z'),
            customTabbedZ = html.find('.tabbed-z');

        // If the custom HTML is set, use it
        if (customTabbedZ.children().length > 0) {
            defaultTabbedZ.html(customTabbedZ.html());

            defaultTabbedZ.find('.tabbed-z--slider').slick({
                slidesToShow: 1,
                arrows: false,
                autoplay: true,
                dots: true,
                speed: 1000
            });
        }
        // Else, remove the section since no content was provided for it
        else {
            //defaultTabbedZ.closest('.section').remove();
        }
    }

    setPromoContent(html) {
        let defaultPromoBoxes = $('.promotion-boxes'),
            customPromoBoxes = html.find('.promotion-boxes');

        // If the custom HTML is set, use it
        if (customPromoBoxes.children().length > 0) {
            defaultPromoBoxes.html(customPromoBoxes.html());
        }
        // Else, remove the section since no content was provided for it
        else {
            //defaultPromoBoxes.closest('.section').remove();
        }
    }

    initFacetedSearch() {
        const $productListingContainer = $('#product-listing-container');
        const $facetedSearchContainer = $('#faceted-search-container');
        const productsPerPage = this.context.categoryProductsPerPage;
        const requestOptions = {
            config: {
                category: {
                    shop_by_price: true,
                    products: {
                        limit: productsPerPage,
                    },
                },
            },
            template: {
                productListing: 'category/product-listing',
                sidebar: 'category/sidebar',
            },
            showMore: 'category/show-more',
        };

        this.facetedSearch = new FacetedSearch(requestOptions, (content) => {
            $productListingContainer.html(content.productListing);
            $facetedSearchContainer.html(content.sidebar);

            $('html, body').animate({
                scrollTop: 0,
            }, 100);
        });
    }
}
