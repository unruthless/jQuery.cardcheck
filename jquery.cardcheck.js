/*!
 * jQuery.cardcheck
 * A plugin for detecting and validating credit cards
 * 
 * https://github.com/unruthless/jQuery.cardcheck
 * 
 * Copyright (c) 2010 Ruthie BenDor and Tim Branyen
 * Dual licensed under the MIT and GPL licenses.
 * 
 */

(function(window, document, $) {

    // Plugin
    $.fn.cardcheck = function(opts) {
        
        // Set defaults
        var defaults = $.fn.cardcheck.opts;
        
        // Allow for just a callback to be provided or extend opts
        if (opts && $.isFunction(opts)) {
            defaults.callback = opts;
            opts = defaults;
        }
        else {
            opts = $.extend(defaults, opts);
        }
        
        // Fire on keyup
        return this.bind('keyup', function() {
            
            var cards = opts.types || {},
                num = this.value.replace(/\D+/g, ''), // strip all non-digits
                len = num.length,
                type,
                className = '',
                validLen = false,
                validLuhn = false;
            
            // Get matched type based on credit card number
            $.each(cards, function(name, props) {
                if (props.check.match(num)) {
                    type = name;
                    return false; // break
                }
            });
            
            // If number, cards, and a matched type
            if (num && cards && cards[type]) {
                
                // Assign className based on matched type
                className = cards[type].className;
                
                // Check card length
                validLen = cards[type].check.length(len) ? true : false;
                
                // Check Luhn
                validLuhn = opts.luhn(num, len) ? true : false;
            }
            
            // Invoke callback
            opts.callback.apply(this, [num, len, type, className, validLen, validLuhn, opts]);
        
        });
    };
    
    // Plugin Options
    $.fn.cardcheck.opts = {
        luhn: function(num, len) {
            // http://en.wikipedia.org/wiki/Luhn_algorithm
            if (!num || !len) { return false; }
            num = num.split('').reverse();
            var total = 0,
                i;
            for (i = 0; i < len; i++) {
                num[i] = window.parseInt(num[i], 10);
                total += i % 2 ? 2 * num[i] - (num[i] > 4 ? 9 : 0) : num[i];
            }
            return total % 10 === 0;
        },
        types: {
            'Visa': {
                'className': '.visa',
                'check': {
                    'match':  function(num) { return num[0] === '4'; }, // typeof num[0] = string
                    'length': function(len) { return len === 13 || len === 16; } // typeof len = number
                }
             },
            'American Express': {
                'className': '.amex',
                'check': {
                    'match':  function(num) { return num[0] === '3'; },
                    'length': function(len) { return len === 15; }
                }
            },
            'Mastercard': {
                'className': '.mastercard',
                'check': {
                    'match':  function(num) { return num[0] === '5'; },
                    'length': function(len) { return len === 16; }
                }
            },
            'Discover': {
                'className': '.discover',
                'check': {
                    'match':  function(num) { return num[0] === '6'; },
                    'length': function(len) { return len === 16; }
                }
            }
        },
        callback: $.noop
    };

})(this, this.document, this.jQuery);