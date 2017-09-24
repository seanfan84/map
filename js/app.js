// Class
var Place = function(data) {
    this.name = data.name;
    this.location = data.location;
    this.visible = ko.observable(true);
};
// END OF CLASS

// ViewModel
var MapViewModel = function() {
    var self = this;
    self.filter = ko.observable();
    self.places = ko.observableArray();
    self.dropdownvisible = ko.observable(false);
    self.searchHasFocus = ko.observable(false);

    data.forEach(function(entry) {
        var place = new Place(entry);
        self.places.push(place);
    });

    self.markers = [];

    // On filter value change/update
    self.filter.subscribe(function(newValue) {
        // console.log(newValue)
        self.markers.forEach(function(marker) {
            // if filter is null, no filter is applied show all markers
            if (newValue === '' || newValue === null) {
                marker.setVisible(true);
                recenter();
            } else {
                // Filter implementation Set qualified markers visible
                if (marker.title.toLowerCase().includes(newValue.toLowerCase())) {
                    marker.setVisible(true);
                }
                // Filter implementation Set unqualified markers invisible
                else {
                    marker.setVisible(false);

                }
            }
        });

        // Hide/Show Side bar list entries
        // console.log("newValue is: " + newValue)
        self.places().forEach(function(place) {
            if (newValue === "") {
                // console.log("newvalue is empty string")
                place.visible(true);
            } else {
                if (place.name.toLowerCase().includes(newValue.toLowerCase())) {
                    place.visible(true);
                    // console.log("show " + place.name);
                } else {
                    place.visible(false);
                }
            }
        });
        // Controls dropdown list when search text updates
        if (newValue !== "") {
            // console.log(true);
            self.dropdownvisible(true);
        } else {
            // console.log(false)
            self.dropdownvisible(false);
        }
    });

    self.setFilter = function(place) {
        self.filter(place.name);
        self.dropdownvisible(false);
    };

    // Make Collaction of Markers with Click Event
    self.makeMarkers = function(callback) {
        var bounds = new google.maps.LatLngBounds();

        function handleMarker(thisMarker) {
            return function() {
                self.selectMarker(thisMarker);
                self.showInfo(thisMarker);
            };
        }

        for (var i = 0; i < data.length; i++) {
            var marker = new google.maps.Marker({
                position: data[i].location,
                title: data[i].name,
                label: (i + 1).toString(),
            });

            marker.addListener('click', handleMarker(marker));
            bounds.extend(marker.position);
            self.markers.push(marker);
        }
        callback(bounds);
    };

    var selectedMarker = null;
    // Marker Click Event 1 - Animate Marker
    self.selectMarker = function(marker) {
        // Stop previous marker Animation
        if (selectedMarker) {
            // console.log("selectedMarker");
            selectedMarker.setAnimation(null);
        }
        // Set animation to the selected marker BOUNCE
        marker.setAnimation(google.maps.Animation.BOUNCE);
        selectedMarker = marker;
        // console.log(marker)
    };

    self.stopMarkerAnimation = function() {
        selectedMarker.setAnimation(null);
    };

    var infoTemplate =
        "<div id='infoContainer' style='width:450px'>" +
        "<strong>Street View</strong>" +
        "<div id='pano' class='pano'>Fetching street view</div>" +
        "<div><strong>Wikipedia</strong></div></div>";

    self.showInfo = function(marker) {
        info.setContent(infoTemplate);
        info.setPosition(marker.location);

        wikiRest(marker, function(result) {
            info.setContent(info.getContent() + result);
            info.open(map, marker);
            infoVis = true;

            // If streetView does not load consistantly on other browsers,
            // Consider adding timeout 500ms for the DOM to finish loading.
            streetView(marker, "pano");
        });
    };
};

// Update 1.2 removed javascript/JQuery view control, use custom binding instead
ko.bindingHandlers.dropdownController = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        $(element).keypress(function(e) {
            // console.log(e.keyCode)
            if (e.keyCode === 13) {
                viewModel.dropdownvisible(false);
            }
            return true;
        });
        $(window).keydown(function(e) {
            if (e.keyCode === 27) {
                info.close();
                viewModel.stopMarkerAnimation();
                recenter();
            }
            return true;
        });
        $(window).click(function() {
            // console.log("clickwindow");
            viewModel.dropdownvisible(false);
            return true;
        });
    }
};

var viewModel = new MapViewModel();
ko.options.useOnlyNativeEvents = true;
ko.applyBindings(viewModel);

// END OF VIEWMODEL
// ============================================================
// MAP HANDLING

var map = null;
var center = null,
    zoom = null;
var info = null;
var infoVis = false;

// Initiate Google Map
function initMap() {
    map = new google.maps.Map(
        document.getElementById('map'), {
            scrollwheel: false,
            streetViewControl: false,
            mapTypeControl: false
        }
    );

    // Dynamic zoom and center setting
    viewModel.makeMarkers(function(bounds) {
        viewModel.bounds = bounds;
        map.fitBounds(bounds, 50);
        window.addEventListener("resize", function() {
            // I believe resize event triggers when it started
            // this caused problems when user hit max windowsize
            // or resotore window size. 
            // The center and zoom were set incorrectly without timeout.
            // we need the fitBounds function to run after the resize finishes, 
            // therefore setting a timeout.
            setTimeout(function() {
                map.fitBounds(bounds, 50);
                center = map.getCenter();
                zoom = map.getZoom();
            }, 100);
        });
    });

    // Delayed function: to wait for the map to initialize. 
    // it seems there is no callback for map initialization.
    setTimeout(function() {
        center = map.getCenter();
        zoom = map.getZoom();
    }, 800);

    info = new google.maps.InfoWindow({
        content: "",
        maxWidth: 500
    });

    info.addListener('closeclick', function() {
        viewModel.stopMarkerAnimation();
        recenter();
    });

    // Show all markers
    viewModel.markers.forEach(function(marker) {
        marker.setMap(map);
    });
}

function recenter() {
    map.setCenter(center);
    map.setZoom(zoom);
}

// List item click action
function clickLabel(data, index) {
    var marker = viewModel.markers[index];
    viewModel.selectMarker(marker);
    viewModel.showInfo(marker);
}

// END OF MAP HANDLING
// ============================================================
// AJAX Request Section

var timeOutMessage = "<font color = 'red'>Oops, there may be a connection issue</font>";

function streetView(marker, elementId) {
    var output;
    var theading;
    var tlocation = marker.position;
    var el = document.getElementById(elementId);
    // console.log(el);
    var svs = new google.maps.StreetViewService();
    var panorama = new google.maps.StreetViewPanorama(
        el, {
            disableDefaultUI: true,
            panControl: false,
            scrollwheel: false
        });
    svs.getPanorama({
            location: tlocation,
            preference: "best",
            radius: 500
        },
        function(data, status) {
            // console.log(status);
            if (status === "OK") {
                panorama.setPano(data.location.pano);
                // console.log(data.location);
                theading = google.maps.geometry.spherical.computeHeading(
                    data.location.latLng,
                    tlocation
                );
                panorama.setPov({
                    heading: theading,
                    pitch: 0
                });
                panorama.setVisible(true);
            }
            // if no result
            else if (status === "ZERO_RESULTS") {
                panorama.setVisible(false);
                el.innerHTML = "<font color = 'red'>Oops, the street view could not be found!</font>";
            }
            // Other error
            else {
                output = timeOutMessage;
                el.innerHTML = timeOutMessage;
            }
        }
    );
}

function wikiRest(marker, callback) {
    var output;
    var wikiRestful = "https://en.wikipedia.org/api/rest_v1/page/summary/" + marker.title;

    $.ajax({
        url: wikiRestful,
        dataType: 'json',
        crossDomain: true,
        success: function(data) {
            // console.log(data);
            output = data.extract_html;
            // console.log(output);
            callback(output);
        },
        error: function(xhr, status, error) {
            // console.log(xhr.status + "|"+status + "-" +error)
            if (xhr.status === 404) {
                output = "<font color='red'>The wikipedia resource you requested does not exist</font>";
            } else {
                output = timeOutMessage;
            }
            callback(output);
        }
    });
}