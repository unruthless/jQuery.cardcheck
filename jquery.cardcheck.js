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
        opts = opts && $.isFunction(opts)
                ? (defaults.callback = opts, defaults)
                : $.extend(defaults, opts);
        
        // Callback invokation
        function update(type, className, valid, num) {
            opts.callback.apply(this, [type, className, valid, num, opts, arguments.callee]);
        }
        
        // Fire on keyup
        return this.bind('keyup', function() {
            
            var num = this.value.replace(/\D+/g, ''), // strip all non-digits
                len = num.length,
                type = undefined,
                className = '',
                cards = opts.types || {};
            
            // Get matched type based on credit card number
            $.each(cards, function(name, props) {
                if (props.check.match(num)) {
                    type = name;
                    return false; // break
                }
            });
            
            // If no number, no cards, or no matched type, invoke callback with type = undefined and valid = false
            if (!num || !cards || !cards[type]) {
                update.apply(this, [type, className, false, num]);
                return false; // break
            }
            
            // Assign className based on matched type
            className = cards[type].className;
            
            // If card fails length or Luhn checks, invoke callback with matched type and valid = false
            if (!cards[type].check.length(len) || !opts.luhn(num, len)) {
                update.apply(this, [type, className, false, num]);
                return false; // break
            }
            
            // Invoke callback with matched type and valid = true
            update.apply(this, [type, className, true, num]);
        
        });
    };
    
    // Plugin Options
    $.fn.cardcheck.opts = {
        luhn: function(num, len) {
            // http://en.wikipedia.org/wiki/Luhn_algorithm
            if ( !num || !len ) { return false; }
            num = num.split('').reverse();
            var total = i = 0;
            for (; i < len; i++) {
                num[i] = window.parseInt(num[i], 10);
                total += i % 2 ? 2 * num[i] - (num[i] > 4 ? 9 : 0) : num[i];
            }
            return (total % 10 === 0);
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