(function(factory){
    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'));
    } else {
        factory(jQuery);
    }
}(function($){
	'use strict';

	var min, max, state = 0

	$.fn.autoresize = function(minRows=2, maxRows=false) {
		min = minRows
		max = maxRows
		var el = $(this)
	 	return el.attr('rows', min).css({'resize':'none'}).on('input', function(){ resize(el) })
	}

	function resize(el) {
		el.css('overflow', 'hidden')
		console.log(max)
 		if (max && el.attr('rows') <= max) {
			if (el[0].scrollHeight > el.innerHeight() && el.attr('rows') < max) {
				addRows(el)
			} else if (el.attr('rows') > min) {
				if (el.attr('rows') == max && el[0].scrollHeight > el.innerHeight()) {
					el.css('overflow', 'auto')
				}

				removeRows(el)
			}
		} else {
			if (el[0].scrollHeight > el.innerHeight()) {
				addRows(el)
			} else if (el.attr('rows') > min) {
				removeRows(el)
			}
		}
 	}

 	function addRows(el) {
 		el.attr('rows', +el.attr('rows')+1)
		if (state) { state = 2 }
		resize(el)
 	}

 	function removeRows(el) {
 		if (state == 2) {
			state = 0
		} else {
			state = 1
			el.attr('rows', min)
			resize(el)
		}
 	}
}));