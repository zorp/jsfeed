var template = {
    twitter: '\
        <div class="tweet"> \
            <div class="date">{{created_at}}</div> \
            <div class="message">{{text}}</div> \
            <div class="link"><a href="http://twitter.com/{{user}}/status/{{id_str}}">link</a></div> \
        </div>',
    flickr: '\
        <div class="image"> \
            <div class="date">{{date_taken}}</div> \
            <img src="{{media}}" alt="{{author}}"> \
        </div>',
    render: function(template, data) {
        var tpl = template;
        console.log(data);
        $.each(data, function(key, value) {
            if(key == 'media') {
                value = value.m;
            }
            if(key == 'created_at') {
                value = prettyDate(value);
            }
            if(key == 'user') {
                value = value.screen_name
            }
            tpl = tpl.replace('{{' + key + '}}', value);
        });
        return tpl;
    }
};

var feeds = {

    _request: null,

    _options: {
        loader: '.loader',
        loaderTextComplete: 'Complete!',
        loaderTextLoading: 'Loading...'
    },


    /**
     * Gets the feed data from the selected source
     *
     * @var feed string
     * @var username string
     * @var callback function
     * @var options string
     */
    get: function(feed, username, callback, type) {
        var data,
            uri,
            _this = this;

        if(!feed && !username) {
            throw('Oh noes. We are missing a feed or username');
        }

        switch(feed) {
            case 'twitter':
                uri = _this.adapters.twitter.getUri(username);
            break;
            case 'flickr':
                uri = _this.adapters.flickr.getUri(username, type);
            break;
        }
        _this._sendRequest(uri, _this._options, callback);
    },


    destroy: function() {
        return this._request.abort();
    },


    /**
     * Sends the request to the chosen service. Returns false,
     * or fires a callback.
     *
     * @var uri string
     * @var options object
     * @var callback function
     * @return mixed false/callback
     */
    _sendRequest: function(uri, options, callback) {
        var d = {};

        $(options.loader).html(options.loaderTextLoading).fadeIn();

        this._request = $.ajax({
            url: uri,
            type: 'GET',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',

            /* callbacks */
            complete: function() {
                $(options.loader).html(options.loaderTextComplete).fadeOut();
            },
            success: function(data) {
                d.success = true;
                d.data = data;
                callback(d);
            },
            error: function() {
                d.success = false;
                return d;
            }
        });
    },


    /**
     * adapters for different social networks
     */
    adapters: {
        twitter: {
            uri: 'http://twitter.com/statuses/user_timeline/',
            params: {
                /*'callback': '?'*/
            },
            getUri: function(username) {
                var uri = this.uri + username + '.json?callback=?';
                return uri;
            }
        },
        github: {
            uri: 'http://github.com/api/v1/json/',
            params: {
                /*'callback': '?'*/
            },
            getUri: function(username) {
                var uri = this.uri + username + '?callback=?';
                return uri;
            }
        },
        flickr: {
            uri: {
                'user':  'http://api.flickr.com/services/feeds/photos_public.gne',
                'group': 'http://api.flickr.com/services/feeds/groups_pool.gne'
            },
            params: {
                id: null,
                lang: 'en-us',
                format: 'json'
                /*jsoncallback: '?'*/
            },
            getUri: function(username, type) {
                type = (!type) ? 'user' : type;
                this.params.id = username;

                var uri = this.uri[type] + '?' + $.param(this.params, true) + '&jsoncallback=?';
                return uri;
            }
        }
    }
};

/*
* JavaScript Pretty Date
* Copyright (c) 2008 John Resig (jquery.com)
* Licensed under the MIT license.
*/

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);

    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return;

    return day_diff == 0 && (
            diff < 60 && "just now" ||
            diff < 120 && "1 minute ago" ||
            diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
            diff < 7200 && "1 hour ago" ||
            diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
        day_diff == 1 && "Yesterday" ||
        day_diff < 7 && day_diff + " days ago" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" )
    jQuery.fn.prettyDate = function(){
        return this.each(function(){
            var date = prettyDate(this.title);
            if ( date )
                jQuery(this).text( date );
        });
    };

