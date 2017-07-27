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
	name:"Movie World",
	address:"zzzzz",
	"location" : {
		lat:-27.9056043,
		lng:153.3207476
	},
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

var mapViewModel = function() {
	var self = this;
	self.places = ko.observableArray(data);
	self.filter = ko.observable();

	// On filter value change/update
	self.markers = function(){
		var markersTemp = [];
		for (var i = 0; i < data.length; i++) {
			var marker = new google.maps.Marker({
				position:data[i].location,
				title:data[i].name,
				label:(i+1).toString(),
			})
			marker.addListener('click',(function(marker){
				return function(){
					console.log(marker.title + " clicked")
					// call function that load infowindow
				}
			})(marker)
			)
			markersTemp.push(marker);
		}
		return markersTemp;
	}

	self.filter.subscribe(function(newValue) {
	    // alert("The person's new name is " + newValue);
	    self.markers().forEach(function(marker){
	    	// if filter is null, no filter is applied show all markers
	    	if(newValue === null){
	    		marker.setMap(map)
	    	}
	    	else{
	    		// Filter implementation Set qualified markers visible
	    		if(marker.title.toLowerCase().includes(newValue.toLowerCase())){
	    			console.log("setmap " + marker.title)
	    			marker.setMap(map)
	    		}
	    		// Filter implementation Set unqualified markers invisible
	    		else{
	    			// PROBLEM - setMap(null) not woking
	    			console.log("setnull " + marker.title)
	    			marker.setVisible(false)
	    			marker.setMap(null);
	    			console.log(marker.getMap())
	    		}				
	    	}
	    })
	});


	self.previousMarker = null;
	self.previousInfo = null;
	self.selectMarker = function(marker,info){
		if(self.previousMarker){
			console.log("previousMarker")
			self.previousMarker.setAnimation(null);
			self.previousInfo.close();
		}
		console.log("Marker")
		marker.setAnimation(google.maps.Animation.BOUNCE)
		info.open(map,marker)
		self.previousMarker = marker;
		self.previousInfo = info;
	}
}

var ViewModel = new mapViewModel()
// ViewModel.current.subscribe()
ko.applyBindings(ViewModel);

