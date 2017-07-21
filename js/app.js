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
	self.filter = ko.observable("filter");
	self.current = null

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

