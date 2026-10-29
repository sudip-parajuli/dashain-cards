(function () {
    function report(message) {
        var status = document.getElementById('startup-status');
        if (!status) return;
        status.textContent = 'The card table could not start.';
        document.getElementById('startup-details').textContent = message + ' Please update Android System WebView and try again. Support: hello@techwiredsolutions.com.np';
    }
    window.addEventListener('error', function (event) { report(event.message || 'An app file could not load.'); }, true);
    window.addEventListener('unhandledrejection', function (event) { report(String(event.reason || 'Startup failed.')); });
    window.setTimeout(function () { report('The app is taking longer than expected to load.'); }, 12000);
})();
