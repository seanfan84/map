var home = {lat: -27.942575, lng: 153.408552};

var data = [
{
	name:"Sandcastles on the Broadwater",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9386457,
		"lng" : 153.4067372
	}
},
{
	name:"Heran Building Group",
	address:"zzzzz",
	"location" : {
		"lat" : -27.966909,
		"lng" : 153.415969
	}
},
{
	name:"The Grand Apartments Gold Coast",
	address:"zzzzz",
	"location" : {
		"lat" : -27.942547,
		"lng" : 153.4093
	}
},
{
	name:"Cafe Gold Coast",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9446507,
		"lng" : 153.4098823
	}
},
{
	name:"Sea World",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9532454,
		"lng" : 153.4259149	
	}
},
{
	name:"Warner Bros. Movie World",
	address:"zzzzz",
	"location" : {
		lat:-27.9109247,
		lng:153.3108152
	}
},
{
	name:"Broadwater Parkland",
	address:"zzzzz",
	"location" : {
		"lat" : -27.965906,
		"lng" : 153.4172059
	}
}
]

var Place = function(data){
	this.name = data.name;
	this.location = data.location;
	this.visible = ko.observable(true);
}

var mapViewModel = function() {
	var self = this;
	self.filter = ko.observable();
	self.places = ko.observableArray();
	data.forEach(function(entry){
		var place = new Place(entry)
		self.places.push(place);
	}
	)


	// On filter value change/update
	self.markers = [];

	self.filter.subscribe(function(newValue) {
	    // alert("The person's new name is " + newValue);
	    self.markers.forEach(function(marker){
	    	// if filter is null, no filter is applied show all markers
	    	if(newValue === null){
	    		marker.setMap(map)
	    	}
	    	else{
	    		// Filter implementation Set qualified markers visible
	    		if(marker.title.toLowerCase().includes(newValue.toLowerCase())){
	    			// console.log("setmap " + marker.title)
	    			marker.setMap(map)
	    		}
	    		// Filter implementation Set unqualified markers invisible
	    		else{
	    			marker.setMap(null);
	    		}		
	    	}
	    })

	    // for (var i = 0; i < this.places().length; i++) {
	    // 	var place = this.places()[i].
	    // }
	    self.places().forEach(function(place){
	    	if(newValue === null){
	    		place.visible(true);
	    	}
	    	else{
	    		if(place.name.toLowerCase().includes(newValue.toLowerCase())){
	    			place.visible(true);
	    			console.log("show " + place.name)
	    		}
	    		else{
	    			place.visible(false);
	    		}
	    	}
	    })
	});

	// Make Marker List
	self.makeMarkers = function(){
		for (var i = 0; i < data.length; i++) {
			var marker = new google.maps.Marker({
				position:data[i].location,
				title:data[i].name,
				label:(i+1).toString(),
			})
			marker.addListener('click',(function(marker){
				return function(){
					// console.log(marker.title + " clicked")
					self.selectMarker(marker)
					self.selectInfo(marker)
				}
			})(marker)
			)
			self.markers.push(marker);
		}
	}

	// Select Markers
	var previousMarker = null;
	self.selectMarker = function(marker){
		if(previousMarker){
			console.log("previousMarker")
			previousMarker.setAnimation(null);
			if(previousInfo)previousInfo.close();
		}
		// Set marker BOUNCE
		marker.setAnimation(google.maps.Animation.BOUNCE)
		previousMarker = marker;
	}

	var previousInfo = null;
	self.selectInfo = function(marker){
		if(previousInfo){
			previousInfo.close()
		}
		var info = new google.maps.InfoWindow({
			content:"<div id='pano2' class='pano'></div>"
		})

		thirdParty(marker,function(result){
			previousInfo = info;
			info.setContent(info.getContent()+result)
			info.open(map,marker)
			setTimeout(function(){
				streetView(marker,"pano2")
			}, 200)


		})
	}
	// List Hover
}

var ViewModel = new mapViewModel()
// ViewModel.current.subscribe()
ko.applyBindings(ViewModel);



function streetView(marker,elementId){
	var output;
	var theading;
	var tlocation = marker.position
	var timeout = setTimeout(function() {
		output = "timeOutMessage";
	}, 3000);
	var el = document.getElementById(elementId)
	console.log(el)
	var svs = new google.maps.StreetViewService()
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
			radius:50},
			function(data,status){
				console.log(status)
				if(status==="OK"){
					panorama.setPano(data.location.pano);
					console.log(data.location)
					theading = google.maps.geometry.spherical.computeHeading(
						data.location.latLng, 
						tlocation
						)
					panorama.setPov({
						heading: theading,
						pitch: 0
					});
					panorama.setVisible(true);					
				}
				else{
					console.log("streetView Data not found")
				}
			}
			)
}





var thirdParty = function(marker,callback){
	var timeOutMessage = "Faild to get resource"
	function wiki(marker){
		var output
		var timeout = setTimeout(function() {
			output = timeOutMessage;
		}, 3000);
		var wiki_url = "https://en.wikipedia.org/w/api.php"
		$.ajax({
			url: wiki_url,
			data: {
				"action": "opensearch",
				"search": marker.title
			},
			dataType: 'jsonp',
			type: 'GET',
			headers: {
				'Api-User-Agent': 'Example/1.0'
			},
			success: function(data) {
	            // do something with data
	            // console.log(data)
	            var items = []
	            for (i = 0; i < data[1].length; i++) {
	                // console.log(data[1][i])
	                // console.log(data[2][i])
	                // console.log(data[3][i])
	                items.push("<li class='article'>" +
	                	"<a href='" + data[3][i] + "'>" +
	                	data[1][i] +
	                	"</a>" + "<p>" + data[2][i] + "</p>" +
	                	"</li>")
	            }
	            clearTimeout(timeout);
	            // console.log("WIKI")
	            var output = items.join("");
	            console.log(output);
	            return output;
	        }
	    });
	}
	function fourSquare(marker){
		var output;
		var timeout = setTimeout(function() {
			output = timeOutMessage;
		}, 3000);

		$.ajax({
			url:placeholder,
			dataType:"JSON",
			type:"GET",
			success:function(data){(
				clearTimeout(timeout)
				)}
		})

		output += "foursquare"
		return output
	}

	function nytimes(marker){
		var output;
		var timeout = setTimeout(function() {
			output = "Failed to get resources";
		}, 3000);

		$.ajax({
			url:placeholder,
			dataType:"JSON",
			type:"GET",
			success:function(data){(
				clearTimeout(timeout)
				)}
		});
		output += "streetView"
		return output		
	}

	result = wiki(marker)
	// result += fourSquare(marker)
	// result += nytimes(marker)
	callback(result)
}