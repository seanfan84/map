var data = [
{	
	name:"Ayers Rock",
	"location":{
		"lat":-25.3456562,
		"lng":131.0196362
	}
},
// {
// 	name:"Sea World",
// 	"location" : {
// 		"lat" : -27.9532454,
// 		"lng" : 153.4259149	
// 	}
// },
{
	name:"Warner Bros. Movie World",
	"location" : {
		lat:-27.9109247,
		lng:153.3108152
	}
},
// {
// 	name:"Broadwater Parkland",
// 	"location" : {
// 		"lat" : -27.965906,
// 		"lng" : 153.4172059
// 	}
// },
{
	name:"Sydney Harbour Bridge",
	"location" : {
		"lat" : -33.8523018,
		"lng" : 151.2085984
	}
},
{
	name:"Parliament House, Canberra",
	"location" : {
		"lat" : -35.3082193,
		"lng" : 149.1222036
	}
},
{
	name:"Whitsunday Island",
	"location":{
		"lat":-20.3541826,
		"lng":148.9459432
	}
},
{
	name:"Blablabla Error Test",
	"location" : {
		"lat" : -25.3456562,
		"lng" : 149.1222036
	}	
}
];

var Place = function(data){
	this.name = data.name;
	this.location = data.location;
	this.visible = ko.observable(true);
};

var mapViewModel = function() {
	var self = this;
	self.filter = ko.observable();
	self.places = ko.observableArray();
	data.forEach(function(entry){
		var place = new Place(entry);
		self.places.push(place);
	}
	);

	// On filter value change/update
	self.markers = [];

	self.filter.subscribe(function(newValue) {
		// console.log(newValue)
	    self.markers.forEach(function(marker){
	    	// if filter is null, no filter is applied show all markers
	    	if(newValue === '' || newValue === null){
	    		marker.setMap(map);
	    		recenter();
	    	}
	    	else{
	    		// Filter implementation Set qualified markers visible
	    		if(marker.title.toLowerCase().includes(newValue.toLowerCase())){
	    			marker.setMap(map);
	    		}
	    		// Filter implementation Set unqualified markers invisible
	    		else{
	    			marker.setMap(null);
	    		}		
	    	}
	    });

	    // Hide/Show Side bar list entries
	    self.places().forEach(function(place){
	    	if(newValue === null){
	    		place.visible(true);
	    	}
	    	else{
	    		if(place.name.toLowerCase().includes(newValue.toLowerCase())){
	    			place.visible(true);
	    			console.log("show " + place.name);
	    		}
	    		else{
	    			place.visible(false);
	    		}
	    	}
	    });
	});

	// Make Collaction of Markers with Click Event
	self.makeMarkers = function(callback){
		var bounds = new google.maps.LatLngBounds();

		for (var i = 0; i < data.length; i++) {
			var marker = new google.maps.Marker({
				position:data[i].location,
				title:data[i].name,
				label:(i+1).toString(),
			});
			marker.addListener('click',(function(thisMarker){
				return function(){
					self.selectMarker(thisMarker);
					self.selectInfo(thisMarker);
				};
			}(marker))
			);
			bounds.extend(marker.position);
			self.markers.push(marker);
		}
		callback(bounds);
	};

	var previousMarker = null;

	// Marker Click Event 1 - Animate Marker
	self.selectMarker = function(marker){
		// Stop previous marker Animation
		if(previousMarker){
			// console.log("previousMarker");
			previousMarker.setAnimation(null);
			if(previousInfo)previousInfo.close();
		}
		// Set animation to the selected marker BOUNCE
		marker.setAnimation(google.maps.Animation.BOUNCE);
		previousMarker = marker;
	};

	var previousInfo = null;
	self.selectInfo = function(marker){
		// Close previous info window if left open
		if(previousInfo){
			previousInfo.close();
		}

		// Initialize info window
		var info = new google.maps.InfoWindow({
			content:"<div id='infoContainer' style='width:450px'><strong>Street View</strong>" +
			"<div id='pano2' class='pano'>Fetching street view</div>" +
			"<div><strong>Wikipedia</strong></div></div>",
			maxWidth:500
		});
		info.addListener('closeclick',function(){
			marker.setAnimation(null);
			recenter();
		});

		wiki_rest(marker,function(result){
		// wiki(marker,function(result){
			previousInfo = info;
			info.setContent(info.getContent()+result);
			info.open(map,marker);
			setTimeout(function(){
				streetView(marker,"pano2");
			}, 500);
			// console.log(info.getContent());
		});

		// wiki(marker,function(result){
		// 	previousInfo = info;
		// 	info.setContent(info.getContent()+result);
		// 	info.open(map,marker);
		// 	setTimeout(function(){
		// 		streetView(marker,"pano2");
		// 	}, 500);		
		// });
	};
};


var ViewModel = new mapViewModel();
// ViewModel.current.subscribe()
ko.applyBindings(ViewModel);

// Recenter the map
function recenter(){
	map.setCenter(center);
	map.setZoom(zoom);
}

var timeOutMessage = "<font color = 'red'>Oops, there may be a connection issue</font>";

function streetView(marker,elementId){
	var output;
	var theading;
	var tlocation = marker.position;
	var el = document.getElementById(elementId);
	// console.log(el);


	var svs = new google.maps.StreetViewService();
	var panorama = new google.maps.StreetViewPanorama(
		el,
		{
			disableDefaultUI:true,
			panControl:true,
			scrollwheel:false
		});
	svs.getPanorama(
		{location:tlocation,
			preference:"best",
			radius:500},
			function(data,status){
				// console.log(status);
				if(status==="OK"){
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
				else if(status==="ZERO_RESULTS"){
					panorama.setVisible(false);	
					el.innerHTML = "<font color = 'red'>Oops, the street view could not be found!</font>";
				}
				// Other error
				else{
					output = timeOutMessage;
					el.innerHTML = timeOutMessage;				
				}
			}
	);
}


// // Only restful API is implemented
// function wiki(marker,callback){
// 		// console.log("doing wiki")
// 		var output;
// 		var timeout = setTimeout(function() {
// 			output = timeOutMessage;
// 		}, 3000);
// 		var wiki_url = "https://en.wikipedia.org/w/api.php";
// 		$.ajax({
// 			url: wiki_url,
// 			data: {
// 				"action": "opensearch",
// 				"search": marker.title
// 			},
//   			crossDomain: true,
// 			dataType: 'jsonfm',
// 			type: 'GET',
// 			headers: {
// 				'Api-User-Agent': 'Example/1.0'
// 			},
// 			success: function(data) {
// 	            // console.log(data);
// 	            var items = [];
// 	            for (i = 0; i < data[1].length; i++) {
// 	                // console.log(data[1][i])
// 	                // console.log(data[2][i])
// 	                // console.log(data[3][i])
// 	                items.push("<li class='article'>" +
// 	                	"<a href='" + data[3][i] + "'>" +
// 	                	data[1][i] +
// 	                	"</a>" + "<p>" + data[2][i] + "</p>" +
// 	                	"</li>");
// 	            }
// 	            clearTimeout(timeout);
// 	            output = items.join("");
// 	            // console.log(output);
// 	            callback(output);
// 	        }
// 	    });
// 	}

function wiki_rest(marker,callback){
		var output;
		var wiki_restful = "https://en.wikipedia.org/api/rest_v1/page/summary/" + marker.title;
		
		$.ajax({
			url: wiki_restful,
			dataType:'json',
			crossDomain:true,
			// statusCode:{
			// 	404:function(response){
			// 		// console.log(response);
			// 		output = "<font color='red'>The wikipedia resource you requested does not exist</font>";
			// 		callback(output);
			// 	}
			// },
			success: function(data) {
	            // console.log(data);
	            output = data.extract_html;
	            // console.log(output);
	            callback(output);
	        },
	        error:function(xhr,status,error){
	        	// console.log(xhr.status + "|"+status + "-" +error)
	            // clearTimeout(timeout);
	            if(xhr.status === 404){
	            	output = "<font color='red'>The wikipedia resource you requested does not exist</font>";
	            }
	            else{
	            	output = timeOutMessage
	            }
				callback(output);
	        }
	    });
}

	// function fourSquare(marker){
	// 	var output;
	// 	var timeout = setTimeout(function() {
	// 		output = timeOutMessage;
	// 	}, 3000);

	// 	$.ajax({
	// 		url:placeholder,
	// 		dataType:"JSON",
	// 		type:"GET",
	// 		success:function(data){(
	// 			clearTimeout(timeout)
	// 			)}
	// 	})

	// 	output += "foursquare"
	// 	return output
	// }

	// function nytimes(marker){
	// 	var output;
	// 	var timeout = setTimeout(function() {
	// 		output = "Failed to get resources";
	// 	}, 3000);

	// 	$.ajax({
	// 		url:placeholder,
	// 		dataType:"JSON",
	// 		type:"GET",
	// 		success:function(data){(
	// 			clearTimeout(timeout)
	// 			)}
	// 	});
	// 	output += "ntyimes"
	// 	return output		
	// }

