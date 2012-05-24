// ==UserScript==
// @name 		LoUPak incoming
// @description 	LoU Incoming attacks
// @namespace 		MousePak
// @include 		http://prodgame*.lordofultima.com/*/index.aspx*
// @version 		0.1
// ==/UserScript==

(function () {
    var main = function () {
        this.initialized = false;

        function PakDebug(e) {
            if (window.console && typeof console.log == "function") {
                console.log(e);
            }
        }

        /* main script that defines the plugin bar */
        var createTweak = function () {
			var IncomingAttacks = "";

            qx.Class.define("PakTweak.main", {
                // let's create a new instance for LoUPak
                type:"singleton",
                extend:qx.core.Object,
                members:{
                    initialize:function () {
                        PakDebug("LoUPak initialize");

                        this.app = qx.core.Init.getApplication();
                        this.cInfoView = this.app.getCityInfoView();
                        this.chat = this.app.chat;
                        this.bQc = this.cInfoView.buildingQueue;
                        this.bQh = this.bQc.header;
                        this.tweakPak();
                    },
                    tweakPak:function () {
                        // Create a toolbar in the main area on the left below existing forms.
                        var toolbar = new PakTweak.extraTools();
                        this.bQc.getLayoutParent().addBefore(toolbar.LoUPakToolContainer, this.bQc);
                    }
                }
            });

            qx.Class.define("PakTweak.extraTools", {
                // create a new instance
                extend:qx.core.Object,
                construct:function () {
                    var btn, fn_click;
                    this.LoUPakToolContainer = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

                    this.LoUPakToolContainerBgr = new qx.ui.basic.Image('http://prodcdngame.lordofultima.com/cdn/335296/resource/webfrontend/ui/menues/main_menu/bgr_subheader_citinfo_end.png');
                    this.LoUPakToolContainerBgr.setWidth(338);
                    this.LoUPakToolContainerBgr.setHeight(35);
                    this.LoUPakToolContainer.add(this.LoUPakToolContainerBgr, {left:0, top:0});

                    // Fill the build queue
                    if (true) {
                        btn = new qx.ui.form.Button("+");
                        btn.set({width:20, appearance:"button-text-small", toolTipText:'Estimate incoming based on travel speeds'});
                        fn_click = function () {
							var updateManager = webfrontend.net.UpdateManager.getInstance();
							var data = new qx.util.StringBuilder(2048);
							data.add('{"session":"', updateManager.getInstanceGuid(), '","requestid":"', Math.floor((Math.random()*100)+1), '","requests":', qx.util.Json.stringify("ALL_AT"), "}");
							var req = new qx.io.remote.Request(updateManager.getUpdateService() + "/Service.svc/ajaxEndpoint/Poll", "POST", "application/json");
							req.setProhibitCaching(false);
							req.setRequestHeader("Content-Type", "application/json");
							req.setData(data.get());
							req.addListener("completed", function(e) {IncomingAttacks = e.getContent()[1]['D']['a']; }, this);
							req.addListener("failed", function(e) {return;}, this);
							req.addListener("timeout", function(e) {return;}, this);
							req.send();
							alert("Delay script to gather info....");
							alert(IncomingAttacks.length);

							var serverTime = webfrontend.data.ServerTime.getInstance();
							var output = "";
							for (var i = 0; i < IncomingAttacks.length; i++) {
								var item = IncomingAttacks[i];
								var distance = Math.sqrt( Math.pow((bos.Utils.convertIdToCoodrinates(item.tc).split(":")[0] - bos.Utils.convertIdToCoodrinates(item.c).split(":")[0]), 2) + Math.pow((bos.Utils.convertIdToCoodrinates(item.tc).split(":")[1] - bos.Utils.convertIdToCoodrinates(item.c).split(":")[1]), 2) );

								var diffMs = ((serverTime.getStepTime(item.es) - serverTime.getStepTime(item.ds)) / distance);
								var diffDays = Math.round(diffMs / 86400000); // days
								var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
								var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
								var diffSec = Math.ceil(diffMs /1000);
								IncomingScout = Math.round((Math.round((8 / (diffSec/60) - 1) * 100) * 10) / 10);
								IncomingCav = Math.round((Math.round((10 / (diffSec/60) - 1) * 100) * 10) / 10);
								IncomingInf = Math.round((Math.round((20 / (diffSec/60) - 1) * 100) * 10) / 10);
								IncomingSiege = Math.round((Math.round((30 / (diffSec/60) - 1) * 100) * 10) / 10);
								IncomingBaron = Math.round((Math.round((40 / (diffSec/60) - 1) * 100) * 10) / 10);
								output += item.tpn + " - ";
								output += item.tcn + " - ";
								output += bos.Utils.convertIdToCoodrinates(item.tc) + " - ";
//								output += webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.es)) + " - ";
//								output += webfrontend.Util.getDateTimeString(serverTime.getStepTime(item.ds)) + " - ";
								output += distance + " - ";
								output += "- Baron = " + IncomingBaron + "% -- Siege = " + IncomingSiege + "% -- Inf = " + IncomingInf + "% -- Cav = " + IncomingCav + "% -- Scout = " + IncomingScout + "%\n";
							}
							alert(output);

                        };
                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:30});
                    }

                    // Pay up the resource for all queued buildings
                    if (true) {
                        btn = new qx.ui.form.Button("#");
                        btn.set({width:20, appearance:"button-text-small", toolTipText:"Click to Convert all builds"});
                        fn_click = function () {
                            webfrontend.net.CommandManager.getInstance().sendCommand("BuildingQueuePayAll", {cityid:cgi.getId()})
                        };
                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:52});
                    }


                },
                members:{
                    getCityCommandOverview:function (city, cityId) {
                        var server = webfrontend.data.Server.getInstance();
                        var res = webfrontend.res.Main.getInstance();
                        var _units = [];
                        if (city.getUnitCount() > 0) {
                            var units = city.getUnits();

                            for (var unitId in units) {
                                var unit = {
                                    id:unitId,
                                    name:res.units[unitId].dn,
                                    space:parseInt(res.units[unitId].uc),
                                    amount:parseInt(units[unitId].total)
                                };
                                _units.push(unit);
                            }
                        }
                        return _units;
                    },

                }
			});


        };

        /* startup script to launch the tweak */
        var startup = function () {
            if (typeof qx == 'undefined') {
                window.setTimeout(startup, 1000);
            } else {
                if (typeof window.bos != 'undefined') {
                    if (!startup.initialized) {
                        startup.initialized = true;
                        createTweak();
                        PakTweak.main.getInstance().initialize();
                    }
                } else {
                    window.setTimeout(startup, 1000);
                }
            }
        };

        window.setTimeout(startup, 1000);
    };

    function PakDebug(e) {
        if (window.console && typeof console.log == "function") {
            console.log(e);
        }
    }

    /* inject this script into the website */
    function inject() {
        PakDebug('Injecting LoUPak script');
        var script = document.createElement("script");
        txt = main.toString();
        if (window.opera != undefined) txt = txt.replace(/</g, "&lt;");
        script.innerHTML = "(" + txt + ")();";
        script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(script);
    }

    if (/lordofultima\.com/i.test(document.domain)) inject();

})();
