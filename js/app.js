var home = {lat: -27.942575, lng: 153.408552};

var data = [
{
	name:"Sandcastles on the Broadwater",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9386457,
		"lng" : 153.4067372
	},
	visible:true
},
{
	name:"Heran Building Group",
	address:"zzzzz",
	"location" : {
		"lat" : -27.966909,
		"lng" : 153.415969
	},
	visible:true
},
{
	name:"The Grand Apartments Gold Coast",
	address:"zzzzz",
	"location" : {
		"lat" : -27.942547,
		"lng" : 153.4093
	},
	visible:true
},
{
	name:"Cafe Gold Coast",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9446507,
		"lng" : 153.4098823
	},
	visible:true
},
{
	name:"Sea World",
	address:"zzzzz",
	"location" : {
		"lat" : -27.9532454,
		"lng" : 153.4259149	
	},
	visible:true
},
{
	name:"Movie World",
	address:"zzzzz",
	"location" : {
		lat:-27.9056043,
		lng:153.3207476
	},
	visible:true
},
{
	name:"Broadwater Parkland",
	address:"zzzzz",
	"location" : {
		"lat" : -27.965906,
		"lng" : 153.4172059
	},
	visible:true
}
]

var Place = function(data){
	this.name = data.name;
	this.location = data.location;
	this.visible = ko.observable(true);
}

var mapViewModel = function() {
	var self = this;
	self.places = ko.observableArray();
	data.forEach(function(entry){
			var place = new Place(entry)
			self.places.push(place);
			console.log(place)
		}
	)

	self.filter = ko.observable();


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
	    // self.places().forEach(function(place){
	    // 	if(newValue === null){
	    // 		place.visible = true;
	    // 	}
	    // 	else{
	    // 		if(place.name.toLowerCase().includes(newValue.toLowerCase())){
	    // 			place.visible = true;
	    // 			console.log("show " + place.name)
	    // 		}
	    // 		else{
	    // 			place.visible = false;
	    // 		}
	    // 	}
	    // })
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
	var previousInfo = null;
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
	self.selectInfo = function(marker){
		if(previousInfo){
			previousInfo.close()
		}
		// Making INFO on the fly

		// info.open(map,marker)
		// previousInfo = info;

	}

	// List Hover
}

var ViewModel = new mapViewModel()
// ViewModel.current.subscribe()
ko.applyBindings(ViewModel);

