var aaaa = "";
var updateManager = webfrontend.net.UpdateManager.getInstance();
var data = new qx.util.StringBuilder(2048);
data.add('{"session":"', updateManager.getInstanceGuid(), '","requestid":"', Math.floor((Math.random()*100)+1), '","requests":', qx.util.Json.stringify("ALL_AT"), "}");

var req = new qx.io.remote.Request(updateManager.getUpdateService() + "/Service.svc/ajaxEndpoint/Poll", "POST", "application/json");
req.setProhibitCaching(false);
req.setRequestHeader("Content-Type", "application/json");
req.setData(data.get());
req.addListener("completed", function(e) {aaaa = e.getContent()[1]['D']['a']; }, this);
req.addListener("failed", function(e) {return;}, this);
req.addListener("timeout", function(e) {return;}, this);
req.send();



},

completeRequest: function(e) {
		
	if (e.getContent() == null) return;
			
	for (var i = 0; i < e.getContent().length; i++) {
		var item = e.getContent()[i];
		var type = item.C;
		if (type == "CITY") {
			this.parseCity(obj, item.D);
		} else if (type == "WORLD") {
			this.parseWorld(item.D);
		} else if (type == "OA") {
			this.parseOA(item.D);
		}
	}
}, 


failRequest: function(e) {
			
}, 
timeoutRequest: function(e) {
			
},
