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
    var defaults;
    
    // Plugin Core
    $.cardcheck = function(opts) {
        var cards = defaults.types || [],
            num = (typeof opts === "string") ? opts : opts.num,
            len = num.length,
            type,
            validLen = false,
            validLuhn = false;
        
        // Get matched type based on credit card number
        $.each(cards, function(index, card) {
            if (card.checkType(num)) {
                type = index;
                return false;
            }
        });
        
        // If number, cards, and a matched type
        if (num && cards && cards[type]) {
            // Check card length
            validLen = cards[type].checkLength(len);
            
            // Check Luhn
            validLuhn = defaults.checkLuhn(num);
        }
        
        return {
            type: type,
            validLen: validLen,
            validLuhn: validLuhn
        };
    };

    // Plugin Helper
    $.fn.cardcheck = function(opts) {
        // Allow for just a callback to be provided or extend opts
        if (opts && $.isFunction(opts)) {
            var _opts = $({}, defaults);
            _opts.callback = opts;
            opts = _opts;
        }
        else {
            opts = $.extend({}, defaults, opts);
        }
        
        // Fire on keyup
        return this.bind('keyup', function() {
            var cards = opts.types || {},
                num = this.value.replace(/\D+/g, ''), // strip all non-digits
                name = '',
                className = '',
                
            // Check card
            check = $.cardcheck({
                num: num
            });
            
            // Assign className based on matched type
            if (typeof check.type === "number") {
                name = cards[check.type].name;
                className = cards[check.type].className;
            }
            
            // Invoke callback
            opts.callback.call(this, {
                num: num,
                len: num.length,
                cardName: name,
                cardClass: className,
                validLen: check.validLen,
                validLuhn: check.validLuhn,
                opts: opts
            });
            
        });
    };
    
    // Plugin Options
    defaults = $.fn.cardcheck.opts = {
        checkLuhn: function(num) {
            // http://en.wikipedia.org/wiki/Luhn_algorithm
            var len = num.length;
            if (!num || !len) {
                return false;
            }
            num = num.split('').reverse();
            var total = 0,
                i;
            for (i = 0; i < len; i++) {
                num[i] = window.parseInt(num[i], 10);
                total += i % 2 ? 2 * num[i] - (num[i] > 4 ? 9 : 0) : num[i];
            }
            return total % 10 === 0;
        },
        // http://en.wikipedia.org/wiki/List_of_Bank_Identification_Numbers
        types: [
            {
                name: 'Visa',
                className: 'visa',
                checkType: function(num) {
                    return num.charAt(0) === '4';
                },
                checkLength: function(len) {
                    return len === 13 || len === 16;
                }
            },
            {
                name: 'American Express',
                className: 'amex',
                checkType: function(num) {
                    return num.substr(0, 2) === '34' || num.substr(0, 2) === '37'
                },
                checkLength: function(len) {
                    return len === 15;
                }
            },
            {
                name: 'MasterCard',
                className: 'mastercard',
                checkType: function(num) {
                    if (num.charAt(0) === '5') {
                        return num.charAt(1) >= 1 && num.charAt(1) <= 5;
                    }
                    return false;
                },
                checkLength: function(len) {
                    return len === 16;
                }
            },
            {
                name: 'Discover',
                className: 'discover',
                checkType:  function(num) {
                    if (num.charAt(0) === '6') {
                        return num.substr(0, 2) === '65' || num.substr(0, 4) === '6011' || num.substr(0, 3) === '644'
                    }
                    return false;
                },
                checkLength: function(len) {
                    return len === 16;
                }
            },
            {
                name: 'JCB',
                className: 'jcb',
                checkType:  function(num) {
                    return num.substr(0, 2) === '35';
                },
                checkLength: function(len) {
                    return len === 16;
                }
            },
            {
                name: 'Diners Club',
                className: 'diners',
                checkType:  function(num) {
                    return num.substr(0, 2) === '36' || num.substr(0, 2) === '38';
                },
                checkLength: function(len) {
                    return len === 14;
                }
            }
        ],
        callback: $.noop
    };

})(this, this.document, this.jQuery);