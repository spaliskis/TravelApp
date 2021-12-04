export default `
<div>
    <style>
            html, body {
                margin: 0;
            }

            #map {
                height: 100%;
                width: 100%;
            }
    </style>
    
    <div id='map' class='map'></div>

    <!-- load TomTom Maps Web SDK from CDN -->
    <link href='https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/<version>/maps/maps.css' rel='stylesheet' type='text/css'>
    <script src='https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/<version>/maps/maps-web.min.js'></script>
    <link href='https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css' rel='stylesheet'>

    <script>
        // create the map
        tt.setProductInfo('TomTom Maps React Native Demo', '1.0');
        let map = tt.map({
            key: '',
            container: 'map',
            language: 'Lithuanian',
            center: [24, 55.5],
            zoom: 7
        });
        
        map.on('dragend', function() {
            let center = map.getCenter();
            window.ReactNativeWebView.postMessage(center.lng.toFixed(3) + ", " + center.lat.toFixed(3));
        })
    </script>
</div>
`;