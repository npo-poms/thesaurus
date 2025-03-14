<%@page contentType="text/javascript"  session="false"
%><%
  response.setHeader("Cache-Control", "max-age=3600");
%>/**
 * You can find an example about how to use this in example/
 */
var gtaa = {
    open: function (callback, options) {
        const domain = '<%= request.getScheme() + "://" + request.getServerName()
        + (request.getScheme().equals("https")
        ?
        (request.getServerPort() == 443 ? "" : ":" + request.getServerPort()) :
        (request.getServerPort() == 80 ? "" : ":" + request.getServerPort()))
        + request.getContextPath() %>';

        let popup;
        let query = '';
        let iframeId;
        if (options) {

            for (const key in options) {
                if (options.hasOwnProperty(key)) {
                    // most (recognized) options are added as query parameters to the popup itself.
                    if ([
                        "name",
                        "givenName",
                        "familyName",
                        "id",
                        "jwt",
                        "jwtExpiration",
                        "schemes",
                        "callbackService",
                        "role"
                    ].indexOf(key) > -1) {
                        var value = options[key];
                        if (value !== '') {
                            if (Array.isArray(value)){
                                for (i in value) {
                                    if (value[i] !== null && value[i] !== undefined) {
                                        query += (query.length ? '&' : '?') + key + '=' + value[i];
                                    }
                                }
                            } else {
                                if (value !== null && value !== undefined) {
                                    query += (query.length ? '&' : '?') + key + '=' + value;
                                }
                            }
                        }
                    } else {
                        if (key === 'iframe') {
                            iframeId = options[key];
                        } else {
                            console && console.log("Unrecognized option", key);
                        }
                    }

                }
            }
        }

        // Create event handlers

        let addEventListener = window.addEventListener;
        let removeEventListener = window.removeEventListener;
        let message = "message";
        if (! addEventListener) {
            // support IE
            addEventListener = window.attachEvent;
            removeEventListener = window.detachEvent;
            message = "onmessage"
        }

        const listener = function (e) {
            if (typeof e.data === 'object') {
                const data = e.data;
                callback(data);
                close();
            } else {
                console && console.log(e);
            }
        };
        function close(){
            if (popup) {
                popup.close();
            }
            removeEventListener(message, listener);

            if (iframehack) {
                iframehack.parentNode.removeChild(iframe);
            }
        }
        // Listen to message from child window
        addEventListener(message, listener, false);
        const popupUrl = domain + '/thesaurus/popup/' + query;
        if (iframeId) {
            const iframe = document.getElementById(iframeId);
            iframe.src = popupUrl;
        } else { //open popup
            let iframehack;
            if (document.all) {
                // some hackery to help IE, because in IE you may not post to other window, only from an iframe.
                iframehack = document.createElement('iframe');
                iframehack.setAttribute('style', 'position:absolute;display:none');
                iframehack = document.body.appendChild(iframe);
                iframehack.src = domain + '/thesaurus/IE.html' + query;
            } else {
                popup = window.open(popupUrl, 'gtaa-popup', 'width=1024,height=800,titlebar=no,toolbar=no,statusbar=no,directories=no,location=no');
            }

        }

    }
};

