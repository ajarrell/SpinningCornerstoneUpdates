import $ from 'jquery';
import PageManager from '../page-manager';

export default class Blog extends PageManager {
	loaded(next) {
		$('.blog-nav-item').matchHeight();
		$('.blog-author').matchHeight();
		$('.blog-card-body').matchHeight();
		$('.blog .card .card-inner').matchHeight();
		$(document).ready(function(){
	        if(document.location.pathname != '/spinlife' && document.location.pathname != '/spinlife/'){
	            $('.blog-home-banner').remove();
	        }
	        else{
	            $('.blog-tag-banner').remove();
	        }
    	});
	}
}
