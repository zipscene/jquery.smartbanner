/*!
 * jQuery Smart Banner
 * Copyright (c) 2014 Rob Hilgefort <rjhilgefort@gmail.com>
 * Based on 'jQuery Smart Banner' by Arnold Daniels <arnold@jasny.net>
 * Based on 'jQuery Smart Web App Banner' by Kurt Zenisek @ kzeni.com
 */
(function ($) {

    // SmartBanner construction
    var SmartBanner = function (options) {
        this.options = $.extend({}, $.smartbanner.defaults, options);

        // Get the original margin-top of the HTML element so we can take that into account
        this.origHtmlMargin = parseFloat($('html').css('margin-top'));

        // Detect banner type (iOS, Android or Windows)
        var UA = navigator.userAgent;
        if (this.options.force) {
            this.type = this.options.force;
        } else if (/iPad|iPhone|iPod/i.test(UA)) {
            // Check webview and native smart banner support (iOS 6+)
            // var iosVersion = window.Number(UA.substr(UA.indexOf('OS ') + 3, 3).replace('_', '.'));
            // if ( /Safari/i.test(UA) && (iosVersion < 6) ) this.type = 'ios';
            this.type = 'ios';
        } else if (/Android/i.test(UA)) {
            this.type = 'android';
        } else if (/Windows NT 6.2/i.test(UA)) {
            this.type = 'windows';
        } else if (/Windows Phone/i.test(UA)) {
            this.type = 'windows-phone';
        }

        // Don't show banner if device isn't iOS or Android, website is loaded in app or user dismissed banner
        if (!this.type || navigator.standalone || this.getCookie('sb-closed') || this.getCookie('sb-installed')) {
            console.log("smartbanner: Not showing banner: Device isn't iOS or Android, website is loaded in app or user dismissed banner");
            return;
        }

        // Calculate scale
        this.scale = this.options.scale === 'auto' ? $(window).width() / window.screen.width : this.options.scale;
        if (this.scale < 1) this.scale = 1;

        // Get info from meta data
        var metaMap = {
            'windows': 'meta[name="msApplication-ID"]',
            'windows-phone': 'meta[name="msApplication-WinPhonePackageUrl"]',
            'android': 'meta[name="google-play-app"]',
            'ios': 'meta[name="apple-itunes-app"]'
        };
        var meta = $(metaMap[this.type]);

        // If we can't find at least one meta tag, don't show the banner
        if (meta.length === 0) {
            console.log("smartbanner: Not showing banner: At least one meta tag with an app id could not be found");
            return;
        }

        // For Windows Store apps, get the PackageFamilyName for protocol launch
        if (this.type === 'windows') {
            this.pfn = $('meta[name="msApplication-PackageFamilyName"]').attr('content');
            this.appId = meta.attr('content')[1];
        } else if (this.type === 'windows-phone') {
            this.appId = meta.attr('content');
        } else {
            this.appId = /app-id=([^\s,]+)/.exec(meta.attr('content'))[1];
        }

        this.title = this.options.title ? this.options.title : $('title').text().replace(/\s*[|\-·].*$/, '');
        this.author = this.options.author ? this.options.author : ($('meta[name="author"]').length ? $('meta[name="author"]').attr('content') : window.location.hostname);

        // Create banner
        this.create();
        this.show();
        this.listen();
    };

    SmartBanner.prototype = {

        constructor: SmartBanner,

        create: function () {
            var iconURL, link,
                $container = $(this.options.container),
                inStore = this.options.price ? '<span class="sb-price">' + this.options.price + '</span> ' + (this.type === 'android' ? this.options.inGooglePlay : this.type === 'ios' ? this.options.inAppStore : this.options.inWindowsStore) : '',
                gloss = this.options.iconGloss;

            var linkMap = {
                'windows': 'ms-windows-store:PDP?PFN=' + this.pfn,
                'windows-phone': 'http://windowsphone.com/s?appId='+this.appId,
                'android': 'market://details?id=' + this.appId,
                'ios': 'https://itunes.apple.com/' + this.options.appStoreLanguage + '/app/id' + this.appId
            };
            link = this.options.url || linkMap[this.type];

            // Check for container to insert element
            if($container.length === 0) {
                console.log("smartbanner: Could not create banner, container not found");
                return;
            }

            // Append banner to page
            $container.prepend(
                '<div id="smartbanner" class="' + this.type + '">' +
                    '<div class="sb-container">' +
                        '<a href="#" class="sb-close">&times;</a>' +
                        '<span class="sb-icon"></span>' +
                        '<div class="sb-info">' +
                            '<strong>' + this.title + '</strong> <span>' + this.author + '</span>' +
                            '<span>' + inStore + '</span>' +
                        '</div>' +
                        '<a class="sb-button" href="' + link + '" target="_blank">' +
                            '<span>' + this.options.button + '</span>' +
                        '</a>' +
                    '</div>' +
                '</div>'
            );

            if (this.options.icon) {
                iconURL = this.options.icon;
            } else if ($('link[rel="apple-touch-icon-precomposed"]').length > 0) {
                iconURL = $('link[rel="apple-touch-icon-precomposed"]').attr('href');
                if (this.options.iconGloss === null) gloss = false;
            } else if ($('link[rel="apple-touch-icon"]').length > 0) {
                iconURL = $('link[rel="apple-touch-icon"]').attr('href');
            } else if ($('meta[name="msApplication-TileImage"]').length > 0) {
                iconURL = $('meta[name="msApplication-TileImage"]').attr('content');
            } else if ($('meta[name="msapplication-TileImage"]').length > 0) { /* redundant because ms docs show two case usages */
                iconURL = $('meta[name="msapplication-TileImage"]').attr('content');
            }

            if (iconURL) {
                $('#smartbanner .sb-icon').css('background-image', 'url(' + iconURL + ')');
                if (gloss) $('#smartbanner .sb-icon').addClass('gloss');
            } else {
                $('#smartbanner').addClass('no-icon');
            }

            this.bannerHeight = $('#smartbanner').outerHeight(false) + 2;

            if (this.scale > 1) {
                $('#smartbanner')
                    .css('top', parseFloat($('#smartbanner').css('top')) * this.scale)
                    .css('height', parseFloat($('#smartbanner').css('height')) * this.scale)
                    .css('width', $(document).width())
                    .hide();
                $('#smartbanner .sb-container')
                    .css('-webkit-transform', 'scale(' + this.scale + ')')
                    .css('-msie-transform', 'scale(' + this.scale + ')')
                    .css('-moz-transform', 'scale(' + this.scale + ')')
                    .css('width', $(document).width() / this.scale);
                $('#smartbanner').css('position', 'static');
            }
        },

        listen: function () {
            $('#smartbanner .sb-close').on('click', $.proxy(this.close, this));
            $('#smartbanner .sb-button').on('click', $.proxy(this.install, this));
        },

        show: function (callback) {
            // Show banner
            $('#smartbanner').stop().animate({
                top: 0
            }, this.options.speedIn).addClass('shown');

            // Move the rest of the page down
            $('html').animate({
                marginTop: this.origHtmlMargin + (this.bannerHeight * this.scale)
            }, this.options.speedIn, 'swing', callback);

            // Account for fixed elements
            $('#smartbanner').siblings().each(function() {
                $this = $(this);
                // TODO This check handles common cases, but not edge cases
                // (ie: fixed elements with percent values described for top)
                if ( $this.css('position') === 'fixed' && $this.css('top') !== null ) {
                    $this.addClass('smartbanner-adjustment');
                }
            });
        },

        hide: function (callback) {
            // Remove banner
            $('#smartbanner').stop().animate({
                top: (-1 * this.bannerHeight * this.scale)
            }, this.options.speedOut ).removeClass('shown');

            // Restore original top margin
            $('html').animate({
                marginTop: this.origHtmlMargin
            }, this.options.speedOut, 'swing', callback);

            // Account for modified fixed elements
            $('#smartbanner').siblings('[class="smartbanner-adjustment"]').removeClass('smartbanner-adjustment');
        },

        close: function (e) {
            e.preventDefault();
            this.hide();
            this.setCookie('sb-closed', 'true', this.options.daysHidden);
        },

        install: function (e) {
            this.hide();
            this.setCookie('sb-installed', 'true', this.options.daysReminder);
        },

        setCookie: function (name, value, exdays) {
            var exdate = new Date();
            exdate.setDate(exdate.getDate() + exdays);
            value = encodeURI(value) + ((exdays === null) ? '' : '; expires=' + exdate.toUTCString());
            document.cookie = name + '=' + value + '; path=/;';
        },

        getCookie: function (name) {
            var i, x, y, ARRcookies = document.cookie.split(";");
            for (i = 0; i < ARRcookies.length; i++) {
                x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
                y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x === name) {
                    return decodeURI(y);
                }
            }
            return null;
        }
    };

    $.smartbanner = function (option) {
        var $window = $(window),
            data = $window.data('typeahead'),
            options = typeof option === 'object' && option;

        if (!data) $window.data('typeahead', (data = new SmartBanner(options)));
        if (typeof option === 'string') data[option]();
    };

    // override these globally if you like (they are all optional)
    $.smartbanner.defaults = {
        title: null, // What the title of the app should be in the banner (defaults to <title>)
        author: null, // What the author of the app should be in the banner (defaults to <meta name="author"> or hostname)
        price: 'FREE', // Price of the app
        appStoreLanguage: 'us', // Language code for App Store
        inAppStore: 'On the App Store', // Text of price for iOS
        inGooglePlay: 'In Google Play', // Text of price for Android
        inWindowsStore: 'In the Windows Store', //Text of price for Windows
        icon: null, // The URL of the icon (defaults to <meta name="apple-touch-icon">)
        iconGloss: null, // Force gloss effect for iOS even for precomposed
        button: 'INSTALL', // Text for the install button
        url: null, // The URL for the button. Keep null if you want the button to link to the app store.
        scale: 'auto', // Scale based on viewport size (set to 1 to disable)
        speedIn: 300, // Show animation speed of the banner
        speedOut: 400, // Close animation speed of the banner
        daysHidden: 15, // Duration to hide the banner after being closed (0 = always show banner)
        daysReminder: 90, // Duration to hide the banner after defaults.button is clicked *separate from when the close button is clicked* (0 = always show banner)
        force: null, // Choose 'ios', 'android' or 'windows'. Don't do a browser check, just always show this banner
        container: 'body' // Container where the banner will be injected
    };

    $.smartbanner.Constructor = SmartBanner;

})(jQuery);
