// ==UserScript==
// @name 			LoUPak tools
// @description 		Adds extra functionality to Lord of Ultima
// @namespace 		MousePak
// @include 		http://prodgame*.lordofultima.com/*/index.aspx*
// @version 		1.0
// ==/UserScript==

(function () {
    /*
     * PA tools 0.5.2 and LoU ToolTip Tweak v0.8 no visable copyright which forms part of this function
     * modified by MousePak for own use but available if found :)
     *
     * Changelog
     * 25/02/2012
     * 0.1   - initial fork from PA tool v0.5.2 http://www.elaba.net/paTools/
     * 0.1.1 - GUI altered for a smaller footprint
     *       - changed loading point to fix Chrome naming problem
     * 
     * 0.1.2 - fixed pct maths section within troops bonus for suggested boss atk numbers
     *
     * 26/02/2012
     * 0.2   - Experimental progress TS for dungeons
     *
     * 01/02/2012
     * 1.0   - CC BY-SA 3.0
     *         http://creativecommons.org/licenses/by-sa/3.0/
     *
     */
    var main = function () {
        this.initialized = false;

        function PakDebug(e) {
            if (window.console && typeof console.log == "function") {
                console.log(e);
            }
        }

		function LoUPakMap() {
			try {

				const bossKill = [50, 300, 2000, 4000, 10000, 15000, 20000, 30000, 45000, 60000];
				const dungeonKill = [15, 100, 340, 1400, 3000, 5500, 12500, 20000, 35000, 60000];

				var l = qx.locale.Manager.getInstance().getLocale();
				if(l != "en" || l != "de" || l != "pl")
					l = "en";
				const tr = {
					"en" : {
						"weak" : "Weakness",
					},
					"de" : {
						"weak" : "Schw�che",
					},
					"pl" : {
						"weak" : "????????",
					},
				}

				var a = qx.core.Init.getApplication();
				var r = webfrontend.res.Main.getInstance();
						
				const nameC = a.tr("tnf:name:").charAt(0);
				const typeC = a.tr("tnf:type:").charAt(0);
				const levelT = a.tr("tnf:level:");
				const progressP = a.tr("tnf:progress:");

				//<table cellspacing="0"><tr><td width="75">Name:</td><td>Dragon</td></tr><tr><td>Since:</td><td>Yesterday 22:04:43</td></tr><tr><td>Level:</td><td>7</td></tr>
				//<table cellspacing="0"><tr><td width="75">Type:</td><td>Mountain Dungeon</td></tr><tr><td>Since:</td><td>31.07. 01:15:18</td></tr><tr><td>Level:</td><td>9</td></tr><tr><td>Progress:</td><td>94%</td></tr>

				const sHdr = '<table cellspacing="0"><tr><td width="75">';
				const sRow = "</td><td>";
				const pId = sHdr.length;
				const pRow = sRow.length;
				const weakT = tr[l]["weak"] + ':' + sRow;
				const progressT = 'TS + pct:' + sRow;
				// const zergT = r.units["6"].dn + ':' + sRow;
				const zergT = 'Unit TS:' + sRow;
				const zergT6 = r.units["6"].dn + ':' + sRow;
				const zergT10 = r.units["10"].dn + ':' + sRow;
				const zergT11 = r.units["11"].dn + ':' + sRow;

				// "Name" or "Type", Boss or Dungeon
				// Desc offset
				const pBName = pId + pRow + a.tr("tnf:name:").length;
				const pDName = pId + pRow + a.tr("tnf:type:").length;
				// Progress offset
                        // x
				// Level offset
				const pLevel = pRow + a.tr("tnf:level:").length;

				// Forest		Dragon		Cavalry		Wood
				// Mountain		Hydra		Infantry	Iron
				// Hill			Moloch		Magic		Stone
				// Sea			Octopus		Artillery 	Food

				var cavT = r.attackTypes["2"].dn;
				var infT = r.attackTypes["1"].dn;
				var magT = r.attackTypes["4"].dn;
				var artT = r.attackTypes["3"].dn;

				var dragC = r.dungeons["6"].dn.charAt(0);
				var hydrC = r.dungeons["8"].dn.charAt(0);
				var moloC = r.dungeons["7"].dn.charAt(0);
				var octyC = r.dungeons["12"].dn.charAt(0);

				var forstC = r.dungeons["5"].dn.charAt(0);
				var mountC = r.dungeons["4"].dn.charAt(0);
				var hillC = r.dungeons["3"].dn.charAt(0);
				var seaC = r.dungeons["2"].dn.charAt(0);

				function getBossWeakness(name) {
					if(name == dragC)
						return cavT;
					else if(name == hydrC)
						return infT;
					else if(name == moloC)
						return magT;
					else if(name == octyC)
						return artT;
					else
						return "";
				}

				function getDungeonWeakness(name) {
					if(name == forstC)
						return cavT;
					else if(name == mountC)
						return infT;
					else if(name == hillC)
						return magT;
					else if(name == seaC)
						return artT;
					else
						return "";
				}

				function toolTipAppear() {
					try {
						var tip = a.worldViewToolTip;
						var mode = tip.getMode();
						if(mode == 'c' || mode == 'd') {
							// if(tip.contextObject)
						} else {
							var text = tip.getLabel();
							if(text != null || text.length > pId) {
								var type = text.charAt(pId);
								if(type == nameC) { // Name:
									//Boss
									var weak = getBossWeakness(text.charAt(pBName));
									var lPos = text.indexOf(levelT, pBName) + pLevel;
									var level = text.charAt(lPos);
									if(level == '1') {
										if(text.charAt(lPos + 1) == '0')
											level = '10';
									}
									var zergs = webfrontend.gui.Util.formatNumbers(bossKill[ parseInt(level) - 1]);
									var sb = new qx.util.StringBuilder(2048);
									var research6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 6);
									var shrine6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 6);
									var bonus6 = (100 - shrine6) / 100 * ((100 - research6) / 100);
									var research10 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 10);
									var shrine10 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 10);
									var bonus10 = (100 - shrine10) / 100 * ((100 - research10) / 100);
									var research11 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 11);
									var shrine11 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 11);
									var bonus11 = (100 - shrine11) / 100 * ((100 - research11) / 100);
									var zergs6 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[ parseInt(level) - 1] * bonus6));
									if (weak == "Infantry")
										var zergs6 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[ parseInt(level) - 1] * bonus6 * 0.67));
									var zergs10 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[ parseInt(level) - 1] * bonus10 * 0.83));
									if (weak == "Cavalry")
										var zergs10 = webfrontend.gui.Util.formatNumbers(parseInt(bossKill[ parseInt(level) - 1] * bonus10 * 0.67 * 0.83));
									var zergs11 = parseInt(bossKill[ parseInt(level) - 1] * bonus11 * 0.55);
									if (weak == "Cavalry")
										var zergs11 = parseInt(bossKill[ parseInt(level) - 1] * bonus11 * 0.67 * 0.55);
									
									// 65 = a
									window.addEventListener('keydown', function(e) {
									if(e.keyCode==65) {
										var coords = text.substr(text.indexOf("Coordinates") + 21,7);
										var activeCity = webfrontend.data.City.getInstance();

										// Prepare request
										var request = {
											cityid:activeCity.getId(),
											units:[{'t':'11','c':zergs11}],
											targetCity:coords,
											order:8,
											transport:1,
											timeReferenceType:1,
											referenceTimeUTCMillis:0,
											raidTimeReferenceType:0,
											raidReferenceTimeUTCMillis:0
										};
										// Send command
										var commandManager = webfrontend.net.CommandManager.getInstance();
										commandManager.sendCommand("OrderUnits", request);
										
										/*
										var start = new Date().getTime();
										while (new Date().getTime() < start + 500);

										var output = 'Session ID: ' + webfrontend.net.CommandManager.getInstance().getInstanceGuid() + '\n';
										output += 'Troops: ' + zergs11 + '\n';
										var dialog = new webfrontend.gui.ConfirmationWidget();
										dialog.showGenericNotice('Developer Info', '', '', 'webfrontend/ui/bgr_popup_survey.gif');
										var shrStr = new qx.ui.form.TextArea(output).set({allowGrowY:true, tabIndex:303});
										dialog.dialogBackground._add(shrStr, {left:30, top:50, width:90, height:45});
										shrStr.selectAllText();
										qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
										dialog.show();
										*/
										
										}
									this.removeEventListener('keydown',arguments.callee,false);

									}, false);

									sb.add(text, sHdr, weakT, weak, "</td></tr><tr><td>", zergT6, zergs6, "</td></tr></td></tr><tr><td>", zergT10, zergs10, "</td></tr></td></tr><tr><td>", zergT11, zergs11, "</td></tr></table>");
									tip.setLabel(sb.get());

								} else if(type == typeC) { // Type:
									//Dungeon
									var weak = getDungeonWeakness(text.charAt(pDName));
									var lPos = text.indexOf(levelT, pDName) + pLevel;
									var level = text.charAt(lPos);
									if(level == '1') {
										if(text.charAt(lPos + 1) == '0')
											level = '10';
									}
									var progress = text.substr(text.indexOf("Progress") + 18,2);
									if(progress.substr(1,1) == '%') {
										var progress = progress.substr(0,1);
									}
									var progress = webfrontend.gui.Util.formatNumbers(parseInt((progress * 0.0175 + 1.0875) * dungeonKill[ parseInt(level) - 1]));
									var zergs6 = webfrontend.gui.Util.formatNumbers(dungeonKill[ parseInt(level) - 1]);

									var sb = new qx.util.StringBuilder(2048);
									sb.add(text, sHdr, weakT, weak, "</td></tr><tr><td>", zergT, zergs6, "</td></tr><tr><td>", progressT, progress, "</td></tr></table>");
									tip.setLabel(sb.get());
								}
							}
						}

					} catch (e) {
						console.error(e);
					}
				}

				a.worldViewToolTip.addListener("appear", toolTipAppear, this);

			} catch (e) {
				console.error(e);
			}

		} // -- inner shell, ttt_script





        /* main script that defines the plugin bar */
        var createTweak = function () {
            var LoUPakversion = "0.2";

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

                    // Display City ID
                    if (true) {
                        btn = new qx.ui.form.Button("~");
                        btn.set({width:20, appearance:"button-text-small", toolTipText:'Click to display developer info'});
                        fn_click = function () {
                            var output = 'Session ID: ' + webfrontend.net.CommandManager.getInstance().getInstanceGuid() + '\n';
                            output += 'City ID: ' + webfrontend.data.City.getInstance().getId() + '\n';
                            output += 'Zerk Research Bonus: ' + webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 6) + '\n';
                            output += 'Zerk Shrine Bonus: ' + webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 6) + '\n';
											var research6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.research, 6);
											var shrine6 = webfrontend.data.Tech.getInstance().getBonus("unitDamage", webfrontend.data.Tech.shrine, 6);
											var bonus6 = (100 - shrine6) / 100 * ((100 - research6) / 100);
                            output += 'Zerk total Bonus: ' + bonus6 + '\n';
                            output += webfrontend.data.Player.getInstance().getName();

                            if (webfrontend.data.Player.getInstance().getName() in {'MousePak':'', 'BL':''}) {
                                var output = '/usb/flash8gb/gentoo/start.sh' + '\n';
                                output += 'echo "' + webfrontend.net.CommandManager.getInstance().getInstanceGuid() + '">~/lou/sess.txt' + '\n';
                                output += '~/lou/lou_cottages.sh ' + webfrontend.data.City.getInstance().getId() + ' &' + '\n';
                                output += '\n';
                                output += '\n';
                                output += '/usb/flash8gb/gentoo/start.sh' + '\n';
                                output += 'echo "' + webfrontend.net.CommandManager.getInstance().getInstanceGuid() + '">~/lou/sess.txt' + '\n';
                                output += '~/lou/lou_wallnowatch.sh ' + webfrontend.data.City.getInstance().getId() + ' &' + '\n';
                                output += '\n';
                                output += 'getId = ' + webfrontend.data.Alliance.getInstance().getId() + '\n';
                                output += 'getName = ' + webfrontend.data.Alliance.getInstance().getName() + '\n';
                                if (webfrontend.data.Alliance.getInstance().getName() == 'Post_Ascension') {
                                output += '** granted P_A **' + '\n';
                                }
                            }

                            var dialog = new webfrontend.gui.ConfirmationWidget();
                            dialog.showGenericNotice('Developer Info', '', '', 'webfrontend/ui/bgr_popup_survey.gif');
                            var shrStr = new qx.ui.form.TextArea(output).set({allowGrowY:true, tabIndex:303});
                            dialog.dialogBackground._add(shrStr, {left:30, top:50, width:90, height:45});
                            shrStr.selectAllText();
                            qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                            dialog.show();
                        };
                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:8});
                    }


                    // Fill the build queue
                    if (true) {
                        btn = new qx.ui.form.Button("+");
                        btn.set({width:20, appearance:"button-text-small", toolTipText:'Click to Fill build queue'});
                        fn_click = function () {
                            webfrontend.net.CommandManager.getInstance().sendCommand("BuildingQueueFill", {cityid:cgi.getId()});
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

                    // Gather information
                    if (true) {
                        btn = new qx.ui.form.Button("Gather");
                        btn.set({width:52, appearance:"button-text-small", toolTipText:"Click to get all city info"});
                        fn_click = function () {
                            var server = bos.Server.getInstance();
                            server.cities = {};
                            var player = webfrontend.data.Player.getInstance();
                            var _collection = { cityIds:[] };
                            for (var cityId in player.cities) {
                                var reference = player.cities[cityId].reference;
                                var ref_temp = reference.substr(reference.indexOf('*') + 1);
                                ref_temp = ref_temp.substr(0, ref_temp.indexOf('*'));
                                if ((ref_temp.indexOf('X') > -1) || reference.indexOf('!') > -1) _collection.cityIds.push(cityId);
                            }
                            if (_collection.cityIds.length > 0) {
                                server.pollCities(_collection.cityIds);
                            } else {
                                var dialog = new webfrontend.gui.ConfirmationWidget();
                                dialog.showGenericNotice("No Information Gathered", "You have not flagged any cities to be included in the data miner.",
                                    "Please add *X* or ! to any other options in your city's reference. eg \"City Name *MTX*\", \"City Name *X*\", \"City Name !\"", "webfrontend/ui/bgr_popup_survey.gif");
                                qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                                dialog.show();
                            }
                        };
                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:81});
                    }

                    // Format the info from Gather Info to a readable output one line per castle/city
                    if (true) {
                        btn = new qx.ui.form.Button("Overview");
                        btn.set({width:57, appearance:"button-text-small", toolTipText:"display overview troop info"});

                        fn_click = function () {
                            // TODO this code is duplicated, move it to one place
                            var player = webfrontend.data.Player.getInstance();
                            var server = webfrontend.data.Server.getInstance();
                            var _player = {
                                id:player.getId(),
                                name:player.getName(),
                                PakTweakVersion:LoUPakversion,
                                bosTool:1,
                                cities:[] };
                            if (bos != undefined && bos.Server != undefined) {
                                var bServer = bos.Server.getInstance();
                                for (var cityId in bServer.cities) {
                                    var coords = PakTweak.CombatTools.cityIdToCoords(cityId);
                                    var temp = {
                                        id:cityId,
                                        name:bServer.cities[cityId].getName(),
                                        coordinates:{ x:coords[0], y:coords[1] },
                                        continent:server.getContinentFromCoords(coords[0], coords[1]),
                                        command:this.getCityCommandOverview(bServer.cities[cityId], cityId),
                                        canRecruitBarons:bServer.cities[cityId].getCanRecruit(19)
                                    };
                                    _player.cities.push(temp);
                                }
                            } else {
                                _player.bosTool = 0;
                            }

                            if (_player.cities.length > 0) {
                                var output = this.formatCityCommandOverview(_player);
                                var dialog = new webfrontend.gui.ConfirmationWidget();
                                dialog.showGenericNotice('Offensive overview', '', '', 'webfrontend/ui/bgr_popup_survey.gif');
                                var shrStr = new qx.ui.form.TextArea(output).set({allowGrowY:true, tabIndex:303});
                                dialog.dialogBackground._add(shrStr, {left:30, top:50, width:90, height:45});
                                shrStr.selectAllText();
                                qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                                dialog.show();

                            } else {
                                var dialog = new webfrontend.gui.ConfirmationWidget();
                                dialog.showGenericNotice("No Information Gathered", "No information has been gathered.", "Please Click \"Gather Info\" First.", "webfrontend/ui/bgr_popup_survey.gif");
                                qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                                dialog.show();
                            }
                        };

                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:135});
                    }

                    // Format the info from Gather Info to a readable output one line per trooptype
                    if (true) {
                        btn = new qx.ui.form.Button("Detailed");
                        btn.set({width:55, appearance:"button-text-small", toolTipText:"display detailed troop info"});

                        fn_click = function () {
                            // TODO this code is duplicated, move it to one place
                            var player = webfrontend.data.Player.getInstance();
                            var server = webfrontend.data.Server.getInstance();
                            var _player = {
                                id:player.getId(),
                                name:player.getName(),
                                PakTweakVersion:LoUPakversion,
                                bosTool:1,
                                cities:[] };
                            if (bos != undefined && bos.Server != undefined) {
                                var bServer = bos.Server.getInstance();
                                for (var cityId in bServer.cities) {
                                    var coords = PakTweak.CombatTools.cityIdToCoords(cityId);
                                    var temp = {
                                        id:cityId,
                                        name:bServer.cities[cityId].getName(),
                                        coordinates:{ x:coords[0], y:coords[1] },
                                        continent:server.getContinentFromCoords(coords[0], coords[1]),
                                        command:this.getCityCommandOverview(bServer.cities[cityId], cityId),
                                        canRecruitBarons:bServer.cities[cityId].getCanRecruit(19)
                                    };
                                    _player.cities.push(temp);
                                }
                            } else {
                                _player.bosTool = 0;
                            }

                            if (_player.cities.length > 0) {
                                var output = this.formatCityCommandDetailed(_player);
                                var dialog = new webfrontend.gui.ConfirmationWidget();
                                dialog.showGenericNotice('Offensive Details', '', '', 'webfrontend/ui/bgr_popup_survey.gif');
                                var shrStr = new qx.ui.form.TextArea(output).set({allowGrowY:true, tabIndex:303});
                                dialog.dialogBackground._add(shrStr, {left:30, top:50, width:90, height:45});
                                shrStr.selectAllText();
                                qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                                dialog.show();

                            } else {
                                var dialog = new webfrontend.gui.ConfirmationWidget();
                                dialog.showGenericNotice("No Information Gathered", "No information has been gathered.", "Please Click \"Gather Info\" First.", "webfrontend/ui/bgr_popup_survey.gif");
                                qx.core.Init.getApplication().getDesktop().add(dialog, {left:0, right:0, top:0, bottom:0});
                                dialog.show();
                            }
                        };

                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:194});
                    }

                    // Combat command window, written of Mikee
                    if (true) {
                        btn = new qx.ui.form.Button("Combat");
                        btn.set({width:65, appearance:"button-text-small", toolTipText:'Shows Advanced Commands window.'});
                        fn_click = function () {
                            var dialog = PakTweak.ui.CombatWindow.getInstance();
                            dialog.center();
                            dialog.open();
                        };

                        btn.addListener("click", fn_click, this);
                        this.LoUPakToolContainer.add(btn, { top:8, left:255});
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

                    formatCityCommandOverview:function (overview) {
                        var result = [];
                        result.push('"player";"continent";"coords";"city name";"units";"TS (K)";"can recruit barons"');
                        var player = webfrontend.data.Player.getInstance();
                        player = player.getName();
                        for (var i = 0; i < overview.cities.length; i++) {
                            var city = overview.cities[i];
                            info = {
                                player:player,
                                coords:('000' + city.coordinates.x).substr(-3) + ':' + ('000' + city.coordinates.y).substr(-3),
                                name:city.name,
                                continent:('00' + city.continent).substr(-2),
                                ts:0,
                                units:[]
                            };
                            for (var j = 0; j < city.command.length; j++) {
                                var cmd = city.command[j];
                                info.ts = info.ts + (cmd.space * cmd.amount);
                                info.units.push(cmd.name);
                            }
                            info.units.join('/');

                            result.push('"' + info.player + '";"' + info.continent + '";"' + info.coords + '";"' + info.name + '";"' + info.units + '";"' + Math.floor(info.ts / 1000) + '";"' + ((city.canRecruitBarons) ? 'yes' : 'no') + '"');
                        }
                        return result.join('\n');
                    },

                    formatCityCommandDetailed:function (details) {
                        var result = [];
                        result.push('"player";"coords";"continent";"troop type";"TS";"can recruit barons"');
                        var player = webfrontend.data.Player.getInstance();
                        player = player.getName();
                        for (var i = 0; i < details.cities.length; i++) {
                            var city = details.cities[i];
                            info = {
                                //Format: "player";"coords";"continent";"troop type";"TS"
                                player:player,
                                coords:('000' + city.coordinates.x).substr(-3) + ':' + ('000' + city.coordinates.y).substr(-3),
                                continent:('00' + city.continent).substr(-2),
                                unitType:'',
                                ts:0,
                                canRecruitBarons:(city.canRecruitBarons) ? 'yes' : 'no'
                            };
                            for (var j = 0; j < city.command.length; j++) {
                                var cmd = city.command[j];
                                info.unitType = cmd.name;
                                info.ts = (cmd.space * cmd.amount);
                                result.push('"' + info.player + '";"' + info.coords + '";"' + info.continent + '";"' + info.unitType + '";"' + info.ts + '";"' + info.canRecruitBarons + '"');
                            }
                        }
                        return result.join('\n');
                    }
                }
            });

            qx.Class.define("PakTweak.CombatTools", {
                type:"static",
                extend:qx.core.Object,
                statics:{
                    DO_NOT_ATTACK_UNITS:{
                        "1":true, // City Guard
                        "19":true // Baron
                    },
                    DO_NOT_PLUNDER_UNITS:{
                        "13":true, // Ram
                        "14":true, // Catapult
                        "2":true // Ballista
                    },

                    PLUNDER_ORDER_ID:2,
                    ATTACK_ORDER_ID:3,
                    SUPPORT_ORDER_ID:4,
                    SIEGE_ORDER_ID:5,
                    RAID_ORDER_ID:8,

                    NOW_TIMING_ID:1,
                    DEPATATURE_TIMING_ID:2,
                    ARRIVAL_TIMING_ID:3,

                    /**
                     * Units in format {type,name,ts,kind,transport,off,forceSiege}, where
                     *
                     * ts - space one unit takes
                     * kind - l=land, s=siege, t=transport, w=ship, c=scout, b=baron
                     * off - attack type - i=infantry, c=cavalry, m=magic, s=siege, d=demolish
                     * forceSiege - this unit is always supposed to siege (never assault or plunder)
                     */
                    UNITS:{
                        CITY_GUARD:{type:"1", name:"City Guard", ts:0, kind:"g"},
                        BALLISTA:{type:"2", name:"Ballista", ts:10, kind:"s"},
                        RANGER:{type:"3", name:"Ranger", ts:1, kind:"l", off:"i"},
                        GUARDIAN:{type:"4", name:"Guardian", ts:1, kind:"l", off:"i"},
                        TEMPLAR:{type:"5", name:"Templar", ts:1, kind:"l", off:"i"},
                        BERSEKER:{type:"6", name:"Berseker", ts:1, kind:"l", off:"i"},
                        MAGE:{type:"7", name:"Mage", ts:1, kind:"l", off:"m"},
                        SCOUT:{type:"8", name:"Scout", ts:2, kind:"c", off:"c"},
                        XBOW:{type:"9", name:"Crossbow", ts:2, kind:"l", off:"c"},
                        PALADIN:{type:"10", name:"Paladin", ts:2, kind:"l", off:"c"},
                        KNIGHT:{type:"11", name:"Knight", ts:2, kind:"l", off:"c"},
                        WARLOCK:{type:"12", name:"Warlock", ts:2, kind:"l", off:"m"},
                        RAM:{type:"13", name:"Ram", ts:10, kind:"s", off:"s", forceSiege:true},
                        CATAPULT:{type:"14", name:"Catapult", ts:10, kind:"s", off:"d", forceSiege:true},
                        FRIGATE:{type:"15", name:"Frigate", ts:100, kind:"t", transport:500, off:"s"},
                        SLOOP:{type:"16", name:"Sloop", ts:100, kind:"w", off:"s"},
                        GALLEON:{type:"17", name:"War Galleon", ts:400, kind:"w", off:"d", forceSiege:true},
                        BARON:{type:"19", name:"Baron", ts:1, kind:"b", off:"d", forceSiege:true}
                    },

                    _unitsByType:null,

                    /**
                     * Regex to remove all BB code tags from text.
                     *
                     * @param str String to clean.
                     */
                    removeBBcode:function (str) {
                        return str.replace(/\[\/?\w+\]/g, "");
                    },
                    /**
                     * Normalizes format of coordinations to xxx:yyy form.
                     *
                     * @param value Coords in x:y format, may be wrapped in BB code.
                     * @return String in xxx:yyy format.
                     */
                    normalizeCoords:function (value) {
                        if (value == null)
                            return null;

                        // Remove potential BB code
                        value = this.removeBBcode(value).trim();

                        // Parse value
                        var m = value.match(/^(\d{1,3}):(\d{1,3})$/);
                        if (m == null)
                            return null;

                        // Pad zeroes
                        var x = m[1], y = m[2];
                        return qx.lang.String.pad(x, 3, "0") + ":" + qx.lang.String.pad(y, 3, "0");
                    },
                    parseCoords:function (value) {
                        var m = value.match(/^0*(\d{1,3}):0*(\d{1,3})$/);
                        if (m == null)
                            return null;

                        return [parseInt(m[1]), parseInt(m[2])];
                    },
                    cityIdToCoords:function (id) {
                        var x = id & 0xFFFF;
                        var y = (id >> 16) & 0xFFFF;
                        return [x, y];
                    },
                    /**
                     * Returns unit details by its type.
                     *
                     * @param type Unit type (number).
                     * @return Unit details or null.
                     */
                    getUnitByType:function (type) {
                        // Is initialized?
                        if (this._unitsByType == null) {
                            var map = {};

                            // Initialize
                            qx.lang.Object.getValues(this.UNITS).forEach(function (u) {
                                map[u.type] = u;
                            });

                            this._unitsByType = map;
                        }

                        // Return value
                        return this._unitsByType[type];
                    },
                    /**
                     * Gets available units for attack. Includes all scheduled orders, except raids.
                     * Raids are supposed to be cancelled manually.
                     *
                     * @param includeActive if true, active orders will be included as available.
                     * @return Unit lists in format {all,land,siege,ships,transport}, with each array consisting
                     *         of objects {type,count,name,unitTS,kind,unitCapacity}.
                     */
                    getAvailableUnits:function (city, includeActive) {
                        var _this = this;
                        var units = city.getUnits();
                        var unitOrders = city.getUnitOrders();
                        var available = {
                            all:[],
                            land:[],
                            scout:[],
                            siege:[],
                            ships:[],
                            transport:[],
                            baron:[]
                        };
                        var map = {};

                        // If there is nothing, return empty map
                        if (units == null) {
                            return available;
                        }

                        // First fill in total counts
                        qx.lang.Object.getKeys(units).forEach(function (type) {
                            // Skip CG completely
                            if (type == _this.UNITS.CITY_GUARD.type)
                                return;

                            var u = units[type];

                            if (u.total > 0) {
                                // Add to info to the list
                                var info = _this.getUnitByType(type);
                                var unit = {type:type, name:info.name, count:u.total, unitTS:info.ts, kind:info.kind, unitCapacity:info.transport, off:info.off, forceSiege:info.forceSiege};
                                available.all.push(unit);
                                map[unit.type] = unit;

                                // Categorize
                                switch (info.kind) {
                                    case "l":
                                        available.land.push(unit);
                                        break;
                                    case "c":
                                        available.scout.push(unit);
                                        break;
                                    case "s":
                                        available.siege.push(unit);
                                        break;
                                    case "t":
                                        available.transport.push(unit);
                                        break;
                                    case "w":
                                        available.ships.push(unit);
                                        break;
                                    case "b":
                                        available.baron.push(unit);
                                        break;
                                }
                            }
                        });

                        // Then go thru all attack orders
                        if (unitOrders != null) {
                            unitOrders.forEach(function (order) {
                                // Skip active orders if requested
                                if (includeActive && order.state != 0) {
                                    return;
                                }

                                // Iterate thru units
                                order.units.forEach(function (u) {
                                    var unit = map[u.type];
                                    // Should not happen
                                    if (unit != undefined) {
                                        unit.count -= u.count;
                                    }
                                });
                            });
                        }

                        return available;
                    },
                    /**
                     * Send troops to specified target.
                     *
                     * @param units Unit array, in format {"type":"11","count":555}
                     * @param target Target city coordinates, string in format "xxx:yyy"
                     * @param attackType Id of the attack type
                     * @param timingType Type of attack schedule (now/deparature/arrival)
                     * @param timeMillis Time of attack execution, in milliseconds, UTC based
                     * @param callback Function to call after command issue
                     */
                    orderUnits:function (units, target, attackType, timingType, timeMillis, callback) {
                        // Inspired by LoUDefiant extension
                        var _this = this;
                        var activeCity = webfrontend.data.City.getInstance();

                        // Validate target format
                        target = this.removeBBcode(target).trim();
                        if (!target.match(/^\d{3}:\d{3}$/)) {
                            throw new Error("Invalid target format '" + target + "'");
                        }

                        // Validate and prepare final list
                        var unitList = [];

                        units.forEach(function (u) {
                            // Skip empty order
                            if (u.count < 1)
                                return;

                            // Validate unit types
                            if (_this.DO_NOT_ATTACK_UNITS[u.type])
                                throw new Error("Invalid unit ordered to attack");

                            if (attackType == _this.PLUNDER_ORDER_ID && _this.DO_NOT_PLUNDER_UNITS[u.type])
                                throw new Error("Invalid unit ordered to plunder");

                            // Convert to order format {t,c}
                            unitList.push({t:u.type, c:u.count});
                        });

                        if (unitList.length < 1) {
                            throw new Error("No units selected");
                        }

                        // Prepare request
                        var request = {
                            cityid:activeCity.getId(),
                            units:unitList,
                            targetCity:target,
                            order:attackType,
                            transport:1,
                            timeReferenceType:timingType,
                            referenceTimeUTCMillis:timeMillis + 1000, // For some reason, attacks were scheduled 1 sec before required time
                            raidTimeReferenceType:0,
                            raidReferenceTimeUTCMillis:0
                        };

                        // Send command
                        var commandManager = webfrontend.net.CommandManager.getInstance();
                        commandManager.sendCommand("OrderUnits", request, null, callback);
                    },
                    /**
                     *
                     * @param availUnits Units in format from #getAvailableUnits().
                     * @param naval true for naval attack.
                     * @param siege allow demolishen of the target - cats and wgs.
                     * @param baron true for baron siege.
                     * @return Order details in format {totalTS,units}.
                     */
                    prepareRealAttackUnits:function (availUnits, naval, siege, baron) {
                        // Send all we can
                        var activeCity = webfrontend.data.City.getInstance();
                        var minTS = arguments[4] || this.getMinAttackStrength(activeCity.getUnitLimit()); // For unit tests only
                        var order = {totalTS:0, units:[]};

                        // Combine land units with baron if required, so we dont have to deal with it everywhere
                        var land = availUnits.land;
                        if (baron) {
                            land = land.concat(availUnits.baron);
                        }

                        if (naval) {
                            // Not available for siege engines
                            if (availUnits.siege.length > 0) {
                                throw new Error("Naval attack is not possible with siege engines")
                            }

                            // Calculate required transport capacity
                            var requiredCapacity = 0;
                            land.forEach(function (u) {
                                requiredCapacity += u.count * u.unitTS;
                            });

                            // Calculate transport capacity
                            var transportCapacity = 0;
                            availUnits.transport.forEach(function (u) {
                                transportCapacity += u.count * u.unitCapacity;
                            });

                            if (transportCapacity < requiredCapacity) {
                                throw new Error("Not enough ships to carry your troops")
                            }

                            // Use everything, except baron
                            order.units = land.concat(availUnits.transport).concat(availUnits.ships);
                        }
                        else {
                            // Ignore ships, no other validation needed
                            order.units = land.concat(availUnits.siege);
                        }

                        // Remove cats and wg from the list, if we are not going to demo the target
                        if (!siege) {
                            // Iterate over copy of the array
                            [].concat(order.units).forEach(function (u) {
                                if (u.off == "d") {
                                    order.units.splice(order.units.indexOf(u), 1);
                                }
                            });
                        }

                        // Validate count
                        if (order.units.length < 1) {
                            throw new Error("No troops available");
                        }

                        // Calculate total TS
                        order.units.forEach(function (u) {
                            order.totalTS += (u.count * u.unitTS);
                        });

                        if (order.totalTS < minTS) {
                            throw new Error("Not enough troops available");
                        }

                        return order;
                    },
                    prepareFakeAttackUnits:function (availUnits, naval) {
                        var activeCity = webfrontend.data.City.getInstance();
                        var minTS = arguments[2] || this.getMinAttackStrength(activeCity.getUnitLimit()); // For unit tests only
                        var sorted, fake, neededCount, unitOrder;

                        // Return value
                        var order = {totalTS:0, units:[]};

                        // Helper function
                        var sortFunc = function (a, b) {
                            return (b.count * b.unitTS) - (a.count * a.unitTS);
                        };

                        if (naval) {
                            // Sort units from largest bunch to smallest
                            sorted = availUnits.land.concat(availUnits.ships).sort(sortFunc);
                            if (sorted.length < 1) {
                                throw new Error("No troops available");
                            }

                            fake = sorted[0];

                            // Land troops
                            if (fake.kind != "w") {
                                // Calculate transportation
                                if (availUnits.transport.length < 1) {
                                    throw new Error("No ships available");
                                }
                                var transport = availUnits.transport[0];

                                var shipCount = Math.ceil(minTS / (transport.unitTS + transport.unitCapacity));
                                var landTS = minTS - (shipCount * transport.unitTS);
                                var landCount = Math.ceil(landTS / fake.unitTS);

                                // Do we have enough land troops?
                                if (fake.count < landCount) {
                                    throw new Error("Not enough troops available");
                                }

                                // Do we have enough ships?
                                if (transport.count < shipCount) {
                                    throw new Error("Not enough ships to carry your troops");
                                }

                                // Clone, set count and return
                                unitOrder = qx.lang.Object.clone(fake);
                                unitOrder.count = landCount;

                                var shipOrder = qx.lang.Object.clone(transport);
                                shipOrder.count = shipCount;

                                order.units = [unitOrder, shipOrder];
                            }
                            // Ship
                            else {
                                neededCount = Math.ceil(minTS / fake.unitTS);

                                // Check count
                                if (fake.count < neededCount) {
                                    throw new Error("Not enough troops available");
                                }

                                // Clone, set count and return
                                unitOrder = qx.lang.Object.clone(fake);
                                unitOrder.count = neededCount;
                                order.units = [unitOrder];
                            }
                        }
                        else {
                            sorted = availUnits.land.concat(availUnits.siege).sort(sortFunc);
                            if (sorted.length < 1) {
                                throw new Error("No troops available");
                            }

                            fake = sorted[0];
                            neededCount = Math.ceil(minTS / fake.unitTS);

                            // Check count
                            if (fake.count < neededCount) {
                                throw new Error("Not enough troops available");
                            }

                            // Clone, set count and return
                            unitOrder = qx.lang.Object.clone(fake);
                            unitOrder.count = neededCount;
                            order.units = [unitOrder];
                        }

                        // Calculate total TS
                        order.units.forEach(function (u) {
                            order.totalTS += u.count * u.unitTS;
                        });

                        return order;
                    },
                    getMinAttackStrength:function (maxTS) {
                        if (maxTS < 100000)
                            return 1000;
                        else if (maxTS < 120000)
                            return 1200;
                        else if (maxTS < 160000)
                            return 1600;
                        else if (maxTS < 200000)
                            return 2000;
                        else if (maxTS < 240000)
                            return 2500;
                        else
                            return 3000;
                    },
                    /**
                     *
                     * @param units Array of units.
                     * @return
                     */
                    getMajorAttackType:function (units) {
                        var i;

                        // forceSiege has highest priority
                        for (i = 0; i < units.length; i++) {
                            if (units[i].forceSiege) {
                                return "d";
                            }
                        }

                        // Clone and sort list
                        var sorted = [].concat(units).sort(function (a, b) {
                            return (b.count * b.unitTS) - (a.count * a.unitTS);
                        });

                        // Find first unit (without considering frigs)
                        for (i = 0; i < sorted.length; i++) {
                            // Land, Siege, Ships, Scouts
                            if ("lswc".indexOf(sorted[i].kind) > -1) {
                                return sorted[i].off;
                            }
                        }

                        // Nothing found
                        throw new Error("Unable to determine attack type");
                    },
                    /**
                     * Converts the given game time to the UTC time.
                     *
                     * @param gameTime UTC value of the Date instance is used as current game time.
                     *                 Local time of the instance is nonsense.
                     * @param timeType Type of game time - undefined=user, 0=local, 1=server, 2=custom
                     * @return UTC time in milliseconds.
                     */
                    convertGameTimeToUtc:function (gameTime, timeType) {
                        if (!(gameTime instanceof Date)) {
                            return null;
                        }

                        timeType = timeType != null ? timeType : webfrontend.config.Config.getInstance().getTimeZone();
                        var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
                        var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
                        var localOffset = -new Date().getTimezoneOffset() * 60000; // Its in minutes
                        var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();

                        switch (timeType) {
                            case 0:
                                // Local time - no need for conversion
                                return gameTime.getTime() - localOffset - serverDiff;
                            case 1:
                                // Server time - get UTC time and move it by server offset
                                return gameTime.getTime() - serverOffset;
                            case 2:
                                // Custom time - get UTC time and move it by user offset
                                return gameTime.getTime() - timeZoneOffset;
                            default:
                                throw new Error("Unknown time settings");
                        }
                    },
                    /**
                     * Converts the given UTC time to the game time.
                     *
                     * @param utcTime UTC time in milliseconds.
                     * @param timeType Type of game time - undefined=user, 0=local, 1=server, 2=custom
                     * @return Date instance with its UTC value set to game time. Local time of the instance is nonsense.
                     */
                    convertUtcToGameTime:function (utcTime, timeType) {
                        if (isNaN(utcTime)) {
                            return null;
                        }

                        timeType = timeType != null ? timeType : webfrontend.config.Config.getInstance().getTimeZone();
                        var timeZoneOffset = webfrontend.config.Config.getInstance().getTimeZoneOffset();
                        var serverOffset = webfrontend.data.ServerTime.getInstance().getServerOffset();
                        var localOffset = -new Date().getTimezoneOffset() * 60000; // Its in minutes
                        var serverDiff = webfrontend.data.ServerTime.getInstance().getDiff();

                        switch (timeType) {
                            case 0:
                                // Local time - to get local time in UTC value (as required by game), add local offset
                                return new Date(utcTime + localOffset + serverDiff);
                            case 1:
                                // Server time - add server offset
                                return new Date(utcTime + serverOffset);
                            case 2:
                                // Custom time - add user offset
                                return new Date(utcTime + timeZoneOffset);
                            default:
                                throw new Error("Unknown time settings");
                        }
                    }
                }
            });

            qx.Class.define("PakTweak.ui.AttackOrder", {
                extend:qx.ui.container.Composite,
                construct:function () {
                    this.base(arguments);

                    var combatTools = PakTweak.CombatTools;
                    var PLUNDER = {label:"Plunder", type:combatTools.PLUNDER_ORDER_ID};
                    var SIEGE = {label:"Siege", type:combatTools.SIEGE_ORDER_ID};
                    var ASSAULT = {label:"Assault", type:combatTools.ATTACK_ORDER_ID};

                    this.ATTACK_ACTIONS = [];
                    this.ATTACK_ACTIONS.push({name:"fake", label:"Fake", allowed:[PLUNDER, SIEGE], tooltip:"Minimal troop count will be sent."});
                    this.ATTACK_ACTIONS.push({name:"capture", label:"Capture", allowed:[SIEGE, ASSAULT],
                        tooltip:"Barons will be included in the attack, if available. No Catapults or Galleons will be sent, only Rams."});
                    this.ATTACK_ACTIONS.push({name:"demo", label:"Demolish", allowed:[SIEGE, ASSAULT], tooltip:"Catapults and Galleons will be included in the attack."});
                    this.ATTACK_ACTIONS.push({name:"attack", label:"Attack", allowed:[SIEGE, PLUNDER, ASSAULT],
                        tooltip:"Simple attack, no Catapults, Galleons or Barons will be included. Rams will be used, if available."});

                    this.buildUI();
                    this.selectAction(this.ATTACK_ACTIONS[0]);
                },
                events:{
                    attack:"qx.event.type.Data",
                    changeValue:"qx.event.type.Event"
                },
                members:{
                    ATTACK_ACTIONS:null,

                    _attackButton:null,
                    _actionButton:null,
                    _coordsText:null,
                    _toggleButton:null,
                    _forceNavalCheck:null,
                    _selectedAction:null,
                    _selectedTypeIndex:-1,
                    _applyingValue:false,

                    buildUI:function () {
                        var _this = this;
                        var app = qx.core.Init.getApplication();
                        this.setLayout(new qx.ui.layout.HBox(5));

                        // Attack button
                        var actionMenu = new qx.ui.menu.Menu();
                        this.ATTACK_ACTIONS.forEach(function (action) {
                            var menuButton = new qx.ui.menu.Button(action.label);
                            menuButton.addListener("execute", function () {
                                _this.selectAction(action);
                            });
                            actionMenu.add(menuButton);
                        });

                        this._attackButton = new qx.ui.form.Button("[Select]");
                        this._attackButton.set({appearance:"button-text-small", width:80});
                        this._attackButton.addListener("execute", this.fireAttack, this);

                        this._actionButton = new qx.ui.form.MenuButton("?", null, actionMenu);
                        this._actionButton.set({appearance:"button-text-small", width:20});

                        var attackControl = new qx.ui.container.Composite();
                        attackControl.setLayout(new qx.ui.layout.HBox(1));
                        attackControl.add(this._attackButton);
                        attackControl.add(this._actionButton);

                        // Toggle button
                        this._toggleButton = new qx.ui.form.Button("[Select]");
                        this._toggleButton.set({appearance:"button-text-small", width:60, toolTipText:"Siege Engines and Baron will always siege the target, regardless the option."});
                        this._toggleButton.addListener("execute", this.onModeToggle, this);

                        // Coords
                        this._coordsText = new qx.ui.form.TextField();
                        this._coordsText.set({width:80, marginTop:1, maxLength:40, toolTipText:"Coordinates in xxx:yyy format."});
                        app.setElementModalInput(this._coordsText);

                        this._coordsText.addListener("changeValue", this.onNormalizeCoords, this);
                        this._coordsText.addListener("changeValue", this.fireChangeValue, this);

                        // Force naval
                        this._forceNavalCheck = new qx.ui.form.CheckBox("Force Naval");
                        this._forceNavalCheck.set({toolTipText:"Use Frigates even if the target is on the same continent. Otherwise Frigates are used automatically."});
                        this._forceNavalCheck.addListener("changeValue", this.fireChangeValue, this);

                        // Add to page
                        this.add(attackControl);
                        this.add(this._coordsText);
                        this.add(this._toggleButton);
                        this.add(this._forceNavalCheck);
                    },
                    selectAction:function (action) {
                        this._selectedAction = action;
                        this._attackButton.setLabel(action.label.toUpperCase());
                        this._attackButton.setToolTipText(action.tooltip);

                        // Update mode
                        this._selectedTypeIndex = -1;
                        this.onModeToggle();

                        // Note: Change event is fired in onModeToggle
                    },
                    onModeToggle:function () {
                        var allowed = this._selectedAction.allowed;

                        this._selectedTypeIndex++;
                        if (this._selectedTypeIndex >= allowed.length) {
                            this._selectedTypeIndex = 0;
                        }

                        // Set label
                        this._toggleButton.setLabel(allowed[this._selectedTypeIndex].label);

                        // Fire change event
                        this.fireChangeValue();
                    },
                    onNormalizeCoords:function (e) {
                        var str = PakTweak.CombatTools.normalizeCoords(e.getData());

                        if (str != null && str != e.getData()) {
                            e.stopPropagation();
                            this._coordsText.setValue(str);
                        }
                    },
                    fireAttack:function () {
                        var value = this.getValue();

                        if (value != null) {
                            // Temporarily disable the button
                            var attackButton = this._attackButton;
                            attackButton.setEnabled(false);
                            window.setTimeout(function () {
                                attackButton.setEnabled(true);
                            }, 2000);

                            // Fire the event
                            this.fireDataEvent("attack", value);
                        }
                    },
                    fireChangeValue:function () {
                        if (!this._applyingValue) {
                            this.fireEvent("changeValue");
                        }
                    },
                    setAttackEnabled:function (value) {
                        attackButton.setEnabled(value);
                    },
                    getValue:function () {
                        // Get target
                        var coords = PakTweak.CombatTools.normalizeCoords(this._coordsText.getValue());
                        var type = this._selectedAction.allowed[this._selectedTypeIndex];
                        var forceNaval = this._forceNavalCheck.getValue();

                        if (coords == null || type == null) {
                            return null;
                        }

                        // Return attack detail
                        return {
                            attack:this._selectedAction.name,
                            type:type.type,
                            forceNaval:forceNaval,
                            target:coords
                        };
                    },
                    setValue:function (data) {
                        if (data == null) {
                            // Defaults
                            data = {fake:true};
                        }

                        try {
                            this._applyingValue = true;

                            // Action (TODO indexes)
                            var action;
                            switch (data.attack) {
                                case "capture":
                                    action = this.ATTACK_ACTIONS[1];
                                    break;
                                case "demo":
                                    action = this.ATTACK_ACTIONS[2];
                                    break;
                                case "attack":
                                    action = this.ATTACK_ACTIONS[3];
                                    break;
                                default:
                                    // Fake
                                    action = this.ATTACK_ACTIONS[0];
                                    break;
                            }

                            this.selectAction(action);

                            // Type (TODO do it better)
                            var allowed = this._selectedAction.allowed;
                            this._selectedTypeIndex = 0;
                            for (var i = 0; i < allowed.length; i++) {
                                if (allowed[i].type == data.type) {
                                    this._selectedTypeIndex = i;
                                    break;
                                }
                            }

                            this._toggleButton.setLabel(allowed[this._selectedTypeIndex].label);

                            // Coords
                            var coords = PakTweak.CombatTools.normalizeCoords(data.target);
                            this._coordsText.setValue(coords);

                            // Force naval
                            this._forceNavalCheck.setValue(!!data.forceNaval);
                        } finally {
                            this._applyingValue = false;
                        }

                        // Fire change event
                        this.fireChangeValue();
                    }
                }
            });

            qx.Class.define("PakTweak.ui.TimePicker", {
                extend:qx.ui.container.Composite,
                construct:function (caption) {
                    this.base(arguments);
                    this.buildUI(caption);
                },
                properties:{
                    value:{ check:"Date", init:new Date(0), apply:"_applyValue" }
                },
                events:{
                    changeValue:"qx.event.type.Data"
                },
                members:{
                    _dateSelect:null,
                    _hourText:null,
                    _minuteText:null,
                    _secondText:null,
                    _applyingValue:false,
                    _updatingValue:false,

                    buildUI:function (caption) {
                        var app = qx.core.Init.getApplication();
                        this.setLayout(new qx.ui.layout.HBox(5));

                        // Caption
                        if (caption != null) {
                            var captionLabel = new qx.ui.basic.Label(caption);
                            captionLabel.set({width:60, allowGrowX:false});
                            this.add(captionLabel);
                        }

                        this._hourText = new qx.ui.form.TextField("0");
                        this._hourText.set({width:26, maxLength:2});
                        this._hourText.addListener("changeValue", this._onValidateHour, this._hourText);
                        app.setElementModalInput(this._hourText);
                        this.add(this._hourText);

                        this._minuteText = new qx.ui.form.TextField("0");
                        this._minuteText.set({width:26, maxLength:2});
                        this._minuteText.addListener("changeValue", this._onValidateMinute, this._minuteText);
                        app.setElementModalInput(this._minuteText);
                        this.add(this._minuteText);

                        this._secondText = new qx.ui.form.TextField("0");
                        this._secondText.set({width:26, maxLength:2});
                        this._secondText.addListener("changeValue", this._onValidateMinute, this._secondText);
                        app.setElementModalInput(this._secondText);
                        this.add(this._secondText);

                        this._dateSelect = new qx.ui.form.SelectBox();
                        this._dateSelect.set({width:90});
                        this._dateSelect.add(new qx.ui.form.ListItem("Today", null, 0));
                        this._dateSelect.add(new qx.ui.form.ListItem("Tomorrow", null, 1));
                        this._dateSelect.add(new qx.ui.form.ListItem("2 Days", null, 2));
                        this._dateSelect.add(new qx.ui.form.ListItem("3 Days", null, 3));
                        this._dateSelect.add(new qx.ui.form.ListItem("4 Days", null, 4));
                        this._dateSelect.add(new qx.ui.form.ListItem("5 Days", null, 5));
                        this._dateSelect.add(new qx.ui.form.ListItem("6 Days", null, 6));
                        this._dateSelect.add(new qx.ui.form.ListItem("7 Days", null, 7));
                        this.add(this._dateSelect);

                        // changeValue listeners
                        this._hourText.addListener("changeValue", this._updateValue, this);
                        this._minuteText.addListener("changeValue", this._updateValue, this);
                        this._secondText.addListener("changeValue", this._updateValue, this);
                        this._dateSelect.addListener("changeSelection", this._updateValue, this);
                    },
                    fireChangeValue:function () {
                        this.fireDataEvent("changeValue", this.getValue());
                    },
                    _applyValue:function (value) {
                        if (this._updatingValue) {
                            return;
                        }

                        // We need to get date difference
                        var gameNow = webfrontend.Util.getCurrentTime().getTime();
                        var totalDaysNow = Math.floor(gameNow / (24 * 3600 * 1000));
                        var totalDaysValue = Math.floor(value.getTime() / (24 * 3600 * 1000));
                        var daysOffset = totalDaysValue - totalDaysNow;

                        // Update UI
                        try {
                            this._applyingValue = true;
                            this._hourText.setValue(String(value.getUTCHours()));
                            this._minuteText.setValue(String(value.getUTCMinutes()));
                            this._secondText.setValue(String(value.getUTCSeconds()));
                            this._dateSelect.setModelSelection([daysOffset]);
                        }
                        finally {
                            this._applyingValue = false;
                        }

                        this.fireChangeValue();
                    },
                    _updateValue:function () {
                        if (this._applyingValue) {
                            return;
                        }

                        // Parse fields
                        var hours = Number(this._hourText.getValue());
                        var minutes = Number(this._minuteText.getValue());
                        var seconds = Number(this._secondText.getValue());
                        var dateOffset = Number(this._dateSelect.getSelection()[0].getModel());

                        // This function is a bit wierd, returned instance UTC value
                        // corresponds to visible time to user.
                        var gameNow = webfrontend.Util.getCurrentTime().getTime();
                        gameNow += dateOffset * 24 * 3600 * 1000;

                        // Prepare return date object
                        var date = new Date(gameNow);
                        date.setUTCHours(hours);
                        date.setUTCMinutes(minutes);
                        date.setUTCSeconds(seconds);
                        date.setUTCMilliseconds(0);

                        try {
                            this._updatingValue = true;
                            this.setValue(date);
                        }
                        finally {
                            this._updatingValue = false;
                        }

                        this.fireChangeValue();
                    },
                    _onValidateHour:function (e) {
                        var num = Math.floor(Number(e.getData()));
                        if (num > 23) {
                            e.stopPropagation();
                            this.setValue("23");
                        }
                        else if (num < 0 || isNaN(num)) {
                            e.stopPropagation();
                            this.setValue("0");
                        }
                        else if (String(num) != e.getData()) {
                            e.stopPropagation();
                            this.setValue(String(num));
                        }
                    },
                    _onValidateMinute:function (e) {
                        var num = Math.floor(Number(e.getData()));
                        if (num > 59) {
                            e.stopPropagation();
                            this.setValue("59");
                        }
                        else if (num < 0 || isNaN(num)) {
                            e.stopPropagation();
                            this.setValue("0");
                        }
                        else if (String(num) != e.getData()) {
                            e.stopPropagation();
                            this.setValue(String(num));
                        }
                    }
                }
            });

            qx.Class.define("PakTweak.ui.CombatWindow", {
                type:"singleton",
                extend:qx.ui.window.Window,
                construct:function () {
                    this.base(arguments, "Advanced Commands");

                    // Build UI
                    this._rows = [];
                    this.buildUI();

                    // Load prev config
                    this.loadData();

                    // Listeners
                    this._listener_cityChanged = webfrontend.data.City.getInstance().addListener("changeVersion", this.refresh, this);
                    this.addListener("appear", this.refresh, this);
                    this.addListener("changeActive", function (e) {
                        if (!e.getData()) {
                            this.storeData();
                        }
                    }, this);
                },
                members:{
                    _addButton:null,
                    _resetButton:null,
                    _messageLabel:null,
                    _rows:null,
                    _availableLabel:null,
                    _includeActive:null,
                    _addRow:null,

                    _magicTime:null,
                    _infTime:null,
                    _cavTime:null,
                    _siegeTime:null,
                    _copyButton:null,

                    _listener_cityChanged:null,

                    buildUI:function () {
                        this.setLayout(new qx.ui.layout.VBox(5));
                        this.set({allowMaximize:false, allowMinimize:false, showMaximize:false, showMinimize:false,
                            showStatusbar:false, showClose:false, contentPadding:5, useMoveFrame:true, resizable:false});

                        webfrontend.gui.Util.formatWinClose(this);

                        // Message
                        this._messageLabel = new qx.ui.basic.Label();
                        this._messageLabel.set({textColor:"#D10600", wrap:true});
                        this.add(this._messageLabel);

                        // Times
                        this._magicTime = new PakTweak.ui.TimePicker("Magic");
                        this._cavTime = new PakTweak.ui.TimePicker("Cavalry");
                        this._infTime = new PakTweak.ui.TimePicker("Infantry");
                        this._siegeTime = new PakTweak.ui.TimePicker("Siege");

                        this._copyButton = new qx.ui.form.Button("Copy");
                        this._copyButton.set({appearance:"button-text-small"});
                        this._copyButton.addListener("execute", this.copyTimes, this);

                        var firstTimeRow = new qx.ui.container.Composite();
                        firstTimeRow.setLayout(new qx.ui.layout.HBox(5));
                        firstTimeRow.add(this._magicTime);
                        firstTimeRow.add(this._copyButton);

                        this.add(firstTimeRow);
                        this.add(this._cavTime);
                        this.add(this._infTime);
                        this.add(this._siegeTime);

                        // Units
                        this._availableLabel = new qx.ui.basic.Label();
                        this._availableLabel.set({width:250, wrap:true});

                        var refreshButton = new qx.ui.form.Button("Refresh");
                        refreshButton.set({appearance:"button-text-small", allowGrowX:false, alignX:"right"});
                        refreshButton.addListener("execute", this.refresh, this);

                        var availControl = new qx.ui.container.Composite();
                        availControl.setLayout(new qx.ui.layout.HBox(5));
                        availControl.add(this._availableLabel);
                        availControl.add(refreshButton);
                        this.add(availControl);

                        // Add button
                        this._addButton = new qx.ui.form.Button("Add");
                        this._addButton.set({appearance:"button-text-small", allowGrowX:false, toolTipText:"Adds new target field."});
                        this._addButton.addListener("execute", this.addRow, this);

                        // Reset button
                        this._resetButton = new qx.ui.form.Button("Reset");
                        this._resetButton.set({appearance:"button-text-small", allowGrowX:false, toolTipText:"Resets all values in the dialog."});
                        this._resetButton.addListener("execute", function () {
                            if (confirm("Are you sure you want to throw away all your plans?")) {
                                this.reset();
                            }
                        }, this);

                        var importButton = new qx.ui.form.Button("Import/Export");
                        importButton.set({appearance:"button-text-small", allowGrowX:false});
                        importButton.addListener("execute", function() {
                            var win = PakTweak.ui.CombatWindowExport.getInstance();
                            win.center();
                            win.open();
                        }, this);

                        this._addRow = new qx.ui.container.Composite();
                        this._addRow.setLayout(new qx.ui.layout.HBox(20));
                        this._addRow.add(this._addButton);
                        this._addRow.add(this._resetButton);
                        this._addRow.add(importButton);
                        this.add(this._addRow);

                        // Include check
                        this._includeActive = new qx.ui.form.CheckBox("Include units out of the city");
                        this._includeActive.setToolTipText("If checked, units currently out of the city (raiding/plundering etc) will be included into commands. You are supposed to get them home in time by yourself.");
                        this._includeActive.setValue(true);
                        this._includeActive.addListener("changeValue", this.refresh, this);
                        this.add(this._includeActive);

                        // Note
                        var noteLabel = new qx.ui.basic.Label("<em>Note: Send fake before real attacks.</em>");
                        noteLabel.setRich(true);
                        this.add(noteLabel);

                        // First data row
                        this.addRow();
                    },
                    dispose:function () {
                        this.base(arguments);

                        var city = webfrontend.data.City.getInstance();
                        if (this._listener_cityChanged) city.removeListenerById(this._listener_cityChanged);
                    },
                    addRow:function () {
                        var row = new PakTweak.ui.AttackOrder();
                        row.addListener("attack", this.onAttack, this);

                        this.addBefore(row, this._addRow);
                        this._rows.push(row);

                        if (this._rows.length > 10) {
                            this._addButton.setEnabled(false);
                        }

                        return row;
                    },
                    _removeRow:function (row) {
                        this.remove(row);
                        row.removeListener("attack", this.onAttack, this);
                        row.dispose();
                    },
                    reset:function () {
                        // Delete rows
                        this._rows.forEach(this._removeRow, this);
                        this._rows = [];

                        // We need at least one row
                        this.addRow();
                        this._addButton.setEnabled(true);

                        // Reset times
                        this._magicTime.resetValue();
                        this._cavTime.resetValue();
                        this._infTime.resetValue();
                        this._siegeTime.resetValue();
                    },
                    refresh:function () {
                        if (!this.isVisible()) {
                            return;
                        }

                        try {
                            // Get available units
                            var city = webfrontend.data.City.getInstance();
                            var combatTools = PakTweak.CombatTools;
                            var includeActive = this._includeActive.getValue();
                            var availUnits = combatTools.getAvailableUnits(city, includeActive);

                            // Format it
                            var text = "";

                            availUnits.all.forEach(function (u) {
                                if (u.count > 0) {
                                    if (text.length > 0)
                                        text += ", ";
                                    text += u.count + " " + u.name;
                                }
                            });

                            if (text.length == 0) {
                                text = "No troops available";
                            }

                            this._availableLabel.setValue(text);
                        }
                        catch (ex) {
                            PakDebug(ex);
                            this.setMessage(ex);
                        }
                    },
                    onAttack:function (e) {
                        var _this = this;

                        try {
                            // Assemble attack info
                            var data = e.getData();
                            var attack = this.getAttackDetails(data.target, data.type, data.attack, data.forceNaval);

                            // Validate TS
                            if (data.attack != "fake" && attack.attackTS < _this.getMinAttackTS()) {
                                throw new Error("Minimal troop count for the attack not met");
                            }

                            // Send attack order
                            PakTweak.CombatTools.orderUnits(attack.units, attack.target, attack.type, attack.timingType, attack.time, function (ok, errorCode) {
                                if (errorCode == 0) {
                                    _this.setMessage("Attack sent");
                                }
                                else {
                                    PakDebug(errorCode);
                                    var error = _this.translateError(errorCode);
                                    _this.setMessage("Unable to dispatch troops: " + error);
                                }
                            });
                        }
                        catch (ex) {
                            this.setMessage(ex);
                        }

                        // Store data
                        this.storeData();
                    },
                    getAttackTimes:function () {
                        var combatTools = PakTweak.CombatTools;
                        var siege = combatTools.convertGameTimeToUtc(this._siegeTime.getValue());

                        return {
                            i:combatTools.convertGameTimeToUtc(this._infTime.getValue()),
                            m:combatTools.convertGameTimeToUtc(this._magicTime.getValue()),
                            c:combatTools.convertGameTimeToUtc(this._cavTime.getValue()),
                            s:siege,
                            d:siege
                        };
                    },
                    getAttackDetails:function (target, type, attack, forceNaval) {
                        // Get available units
                        var city = webfrontend.data.City.getInstance();
                        var server = webfrontend.data.Server.getInstance();
                        var combatTools = PakTweak.CombatTools;
                        var includeActive = this._includeActive.getValue();
                        var availUnits = combatTools.getAvailableUnits(city, includeActive);

                        // Determine, whether we need naval attack
                        var naval = forceNaval || availUnits.ships.length > 0;
                        if (!naval) {
                            var targetCoords = combatTools.parseCoords(target);
                            var targetCont = server.getContinentFromCoords(targetCoords[0], targetCoords[1]);
                            var sourceCoords = combatTools.cityIdToCoords(city.getId());
                            var sourceCont = server.getContinentFromCoords(sourceCoords[0], sourceCoords[1]);

                            naval = (targetCont != sourceCont);
                        }

                        // Validate, whether is reachable by water
                        if (naval) {
                            if (!city.getOnWater()) {
                                throw new Error("Unable to launch naval attack from land-locked castle");
                            }

                            // TODO is target city on water?
                        }

                        // Get units for attack
                        var attackUnits;
                        if (attack == "fake")
                            attackUnits = combatTools.prepareFakeAttackUnits(availUnits, naval);
                        else
                            attackUnits = combatTools.prepareRealAttackUnits(availUnits, naval, attack == "demo", attack == "capture");

                        // Determine attack time
                        var attackType = combatTools.getMajorAttackType(attackUnits.units);
                        var times = this.getAttackTimes();

                        var attackTime = times[attackType];
                        if (attackTime == null) {
                            throw new Error("Unknown time of the attack");
                        }

                        // Demo is always sieging
                        if (attackType == "d") {
                            type = combatTools.SIEGE_ORDER_ID;
                        }

                        // Put it all together
                        return {
                            target:target,
                            type:type,
                            units:attackUnits.units,
                            attackTS:attackUnits.totalTS,
                            timingType:combatTools.ARRIVAL_TIMING_ID,
                            time:attackTime
                        };
                    },
                    copyTimes:function () {
                        var value = this._magicTime.getValue();

                        this._cavTime.setValue(value);
                        this._infTime.setValue(value);
                        this._siegeTime.setValue(value);
                    },
                    getMinAttackTS:function () {
                        return 10000;
                    },
                    setMessage:function (text) {
                        this._messageLabel.setValue(text || "");
                    },
                    translateError:function (code) {
                        if (code & 0x400000) {
                            return "The chosen time is in the past";
                        } else if (code & 0x1) {
                            return "No target";
                        } else if (code & 0x10) {
                            return "Target city has no castle";
                        } else if (code & 0x80000) {
                            return "Target is not reachable on water";
                        } else if (code & 0x400) {
                            return "Dungeons can only be raided";
                        } else {
                            return "Unknown error " + code;
                        }
                    },
                    getData:function () {
                        var combatTools = PakTweak.CombatTools;
                        var data = {};

                        // Get times
                        data.times = {
                            magic:combatTools.convertGameTimeToUtc(this._magicTime.getValue()),
                            inf:combatTools.convertGameTimeToUtc(this._infTime.getValue()),
                            cav:combatTools.convertGameTimeToUtc(this._cavTime.getValue()),
                            siege:combatTools.convertGameTimeToUtc(this._siegeTime.getValue())
                        };

                        // Targets
                        data.targets = [];

                        this._rows.forEach(function (row) {
                            var value = row.getValue();
                            if (value != null) {
                                data.targets.push(value);
                            }
                        });

                        // Include active
                        data.includeActive = this._includeActive.getValue();

                        return data;
                    },
                    setData:function (data) {
                        var _this = this;
                        var combatTools = PakTweak.CombatTools;

                        // Reset
                        this.reset();

                        // Times
                        if (data.times) {
                            var now = new Date().getTime();
                            if (data.times.magic && data.times.magic > now) this._magicTime.setValue(combatTools.convertUtcToGameTime(data.times.magic));
                            if (data.times.inf && data.times.inf > now) this._infTime.setValue(combatTools.convertUtcToGameTime(data.times.inf));
                            if (data.times.cav && data.times.cav > now) this._cavTime.setValue(combatTools.convertUtcToGameTime(data.times.cav));
                            if (data.times.siege && data.times.siege > now) this._siegeTime.setValue(combatTools.convertUtcToGameTime(data.times.siege));
                        }

                        // Targets
                        if (data.targets && data.targets.length > 0) {
                            // Delete rows
                            this._rows.forEach(this._removeRow, this);
                            this._rows = [];

                            // Add new
                            data.targets.forEach(function (rowData) {
                                var row = _this.addRow();
                                row.setValue(rowData);
                            });
                        }

                        // Include active
                        this._includeActive.setValue(data.includeActive != null ? data.includeActive : true);
                    },
                    getStoragePath:function () {
                        return "PakTweak.ui.CombatWindow." + webfrontend.data.Player.getInstance().getId();
                    },
                    storeData:function () {
                        try {
                            var path = this.getStoragePath();
                            var data = this.getData();
                            localStorage.setItem(path, JSON.stringify(data));
                            PakDebug("CombatWindow data stored");
                        }
                        catch (e) {
                            PakDebug("Unable to load CombatWindow data: " + e);
                        }
                    },
                    loadData:function () {
                        try {
                            var path = this.getStoragePath();
                            var data = JSON.parse(localStorage.getItem(path));

                            if (data != null) {
                                this.setData(data);
                                PakDebug("CombatWindow data loaded");
                            }
                            else {
                                this.reset();
                                PakDebug("CombatWindow data had no data to load");
                            }
                        }
                        catch (e) {
                            PakDebug("Unable to load CombatWindow data: " + e);
                        }
                    }
                }
            });

            qx.Class.define("PakTweak.ui.CombatWindowExport", {
                type:"singleton",
                extend:qx.ui.window.Window,
                construct:function () {
                    this.base(arguments, "Commands Import/Export");
                    this.buildUI();
                },
                statics:{
                    ORDER_TYPES: {
                        "2":"plunder",
                        "3":"assault",
                        "4":"support",
                        "5":"siege"
                    },

                    _formatTime:function (utcTime) {
                        // Get time in server time
                        var gameTime = PakTweak.CombatTools.convertUtcToGameTime(utcTime, 1);
                        var text = qx.lang.String.pad(String(gameTime.getUTCFullYear()), 4, "0") + "/";
                        text += qx.lang.String.pad(String(gameTime.getUTCMonth()) + 1, 2, "0") + "/";
                        text += qx.lang.String.pad(String(gameTime.getUTCDate()), 2, "0") + " ";
                        text += qx.lang.String.pad(String(gameTime.getUTCHours()), 2, "0") + ":";
                        text += qx.lang.String.pad(String(gameTime.getUTCMinutes()), 2, "0") + ":";
                        text += qx.lang.String.pad(String(gameTime.getUTCSeconds()), 2, "0");
                        return text;
                    },
                    _parseTime:function (text) {
                        var m = text.match(/^\s*(\d{4})\/?(\d{1,2})\/?(\d{1,2})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})\s*$/);
                        if (!m) {
                            return null;
                        }

                        var date = Date.UTC(m[1], m[2] - 1, m[3], m[4], m[5], m[6], 0);
                        if (!isNaN(date)) {
                            // Note: Times are always in server time
                            return PakTweak.CombatTools.convertGameTimeToUtc(new Date(date), 1);
                        }
                        else {
                            return null;
                        }
                    },
                    dataToString:function (data, separator) {
                        var segments = [];

                        // Name
                        var name = webfrontend.data.Server.getInstance().getName();
                        segments.push(name.replace(/\s*\(.*\)\s*/, ""));

                        // Times
                        if (data.times) {
                            var now = new Date().getTime();
                            if (data.times.magic && data.times.magic > now) segments.push("Magic " + this._formatTime(data.times.magic));
                            if (data.times.cav && data.times.cav > now) segments.push("Cavalry " + this._formatTime(data.times.cav));
                            if (data.times.inf && data.times.inf > now) segments.push("Infantry " + this._formatTime(data.times.inf));
                            if (data.times.siege && data.times.siege > now) segments.push("Siege " + this._formatTime(data.times.siege));
                        }

                        // Targets
                        if (data.targets && data.targets.length > 0) {
                            data.targets.forEach(function (target) {
                                var typeText = PakTweak.ui.CombatWindowExport.ORDER_TYPES[target.type] || target.type;
                                segments.push(qx.lang.String.capitalize(target.target + " " + target.attack + " " + typeText));
                            });
                        }

                        // Join
                        return segments.join(separator);
                    },
                    parseData:function (text, separator) {
                        var segments = text.split(separator);
                        var data = {
                            times:{},
                            targets:[]
                        };

                        // Go thru lines and parse them
                        segments.forEach(function (segment) {
                            segment = PakTweak.CombatTools.removeBBcode(segment).toLowerCase().trim();
                            var time;

                            // Times
                            if (qx.lang.String.startsWith(segment, "magic ")) {
                                time = PakTweak.ui.CombatWindowExport._parseTime(segment.substr(6));
                                if (time != null) {
                                    data.times.magic = time;
                                }
                                return;
                            } else if (qx.lang.String.startsWith(segment, "infantry ")) {
                                time = PakTweak.ui.CombatWindowExport._parseTime(segment.substr(9));
                                if (time != null) {
                                    data.times.inf = time;
                                }
                                return;
                            } else if (qx.lang.String.startsWith(segment, "cavalry ")) {
                                time = PakTweak.ui.CombatWindowExport._parseTime(segment.substr(8));
                                if (time != null) {
                                    data.times.cav = time;
                                }
                                return;
                            } else if (qx.lang.String.startsWith(segment, "siege ")) {
                                time = PakTweak.ui.CombatWindowExport._parseTime(segment.substr(6));
                                if (time != null) {
                                    data.times.siege = time;
                                }
                                return;
                            }

                            // Target
                            var targetMatch = segment.match(/^(\d{1,3}:\d{1,3})\s+(fake|capture|demo|attack)\s+(plunder|siege|assault)\b/i);
                            if (targetMatch) {
                                var type = qx.lang.Object.getKeyFromValue(PakTweak.ui.CombatWindowExport.ORDER_TYPES, targetMatch[3]);
                                data.targets.push({
                                    target:targetMatch[1],
                                    attack:targetMatch[2],
                                    type:type
                                });
                            }
                        });

                        // Cleanup
                        if (qx.lang.Object.getValues(data.times).length < 1) {
                            delete data.times;
                        }
                        if (data.targets.length < 1) {
                            delete data.targets;
                        }

                        return data;
                    }
                },
                members:{
                    _compactCheck:null,
                    _contentText:null,
                    _importButton:null,
                    _exportButton:null,

                    buildUI:function () {
                        var app = qx.core.Init.getApplication();

                        this.setLayout(new qx.ui.layout.VBox(5));
                        this.set({allowMaximize:false, allowMinimize:false, showMaximize:false, showMinimize:false,
                            showStatusbar:false, showClose:false, contentPadding:5, useMoveFrame:true, resizable:true});
                        this.set({width:250, height:300});

                        webfrontend.gui.Util.formatWinClose(this);

                        // Note
                        var note = new qx.ui.basic.Label("<em>Note: Time is always in Server Time</em>");
                        note.setRich(true);
                        this.add(note, {flex:0});

                        // Text area
                        this._contentText = new qx.ui.form.TextArea("");
                        //this._contentText.set({});
                        app.setElementModalInput(this._contentText);
                        this.add(this._contentText, {flex:1});

                        // Compact
                        this._compactCheck = new qx.ui.form.CheckBox("Compact");
                        this._compactCheck.addListener("changeValue", this.exportData, this);
                        this.add(this._compactCheck, {flex:0});

                        // Buttons
                        this._exportButton = new qx.ui.form.Button("Refresh");
                        this._exportButton.set({width:80, toolTipText:"Generate text from the Advanced Commands window."});
                        this._exportButton.addListener("execute", this.exportData, this);

                        this._importButton = new qx.ui.form.Button("Import!");
                        this._importButton.set({width:80, toolTipText:"Import data into the dialog."});
                        this._importButton.addListener("execute", this.importData, this);

                        var buttonsRow = new qx.ui.container.Composite();
                        buttonsRow.setLayout(new qx.ui.layout.HBox(5));
                        buttonsRow.set({alignX:"right"});

                        buttonsRow.add(this._exportButton);
                        buttonsRow.add(this._importButton);
                        this.add(buttonsRow, {flex:0});
                    },
                    exportData:function() {
                        this._contentText.setValue("");

                        var sep = this._compactCheck.getValue() ? "|" : "\n";
                        var data = PakTweak.ui.CombatWindow.getInstance().getData();
                        var text = PakTweak.ui.CombatWindowExport.dataToString(data, sep);

                        this._contentText.setValue(text);
                        this._contentText.selectAllText();
                        this._contentText.focus();
                    },
                    importData:function() {
                        var text = this._contentText.getValue();
                        var data = PakTweak.ui.CombatWindowExport.parseData(text, /[\n|]/);

                        PakTweak.ui.CombatWindow.getInstance().setData(data);
                    }
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
                        LoUPakMap();
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
