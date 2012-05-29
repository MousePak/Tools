// ==UserScript==
// @name 		LoUPak testing
// @description 	Adds extra functionality to Lord of Ultima
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
			var LoUPakversion = "0.2.2";

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
						btn.addListener("click", this.showOptionsPage, this);
						this.srvBar.add(btn, {top: 2, left: 350});
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

				},
				members:{
					showOptionsPage: function() {
						this.app.switchOverlay(this.optionsPage);
					},
				}
			});

			qx.Class.define("PakTweak.optionsPage", {
			  extend: webfrontend.gui.OverlayWidget,
			  construct: function() {
				webfrontend.gui.OverlayWidget.call(this);
				this.clientArea.setLayout(new qx.ui.layout.Canvas());
				this.setTitle("PakTweak");
				this.tabView = new qx.ui.tabview.TabView().set({contentPaddingLeft: 15, contentPaddingRight: 10, contentPaddingTop: 10, contentPaddingBottom: 10});
				this.tabView.add(new PakTweak.gui.AttacksIncoming());
				
				this.clientArea.add(this.tabView, {top: 0, right: 3, bottom: 30, left: 3});
			  },
			  members: {
				tabView: null,
				tabPages: null,
				clrSel: null,
				saveOptions: function() {
				  str = qx.util.Json.stringify(LT.options);
				  localStorage.setItem("LT_options", str);
				  LT.a.switchOverlay(null);
				},
			  }
			});


			qx.Class.define("PakTweak.gui.AttacksIncoming", {
				type:"singleton",
				extend:qx.ui.window.Window,
				construct: function() {
					var PakTweak = window.PakTweak.main.getInstance();
					PakTweak.boss_raider = this;
					bos.gui.SummaryPage.call(this);
					this.setLabel("Incoming Attacks");
					this.setLayout(new qx.ui.layout.VBox(10));
					this.add(this._createToolBar());    
					this._tableModel = new qx.ui.table.model.Simple();
					var columnNames = [ "Id", "Row Info", "Type", "Level", "Pos", "Name", "Distance", "Units", "Actions"];
					var columnIds = ["id", "row_info", "boss_type", "boss_level", "position", "name", "distance", "units", "actions"];
					
					this._tableModel.setColumns(columnNames, columnIds);
					
					this._setupSorting(this._tableModel);
					this._tableModel.sortByColumn(4, true);
					
					var custom = {
					  tableColumnModel : function(obj) {
						return new qx.ui.table.columnmodel.Resize(obj);
					  }
					};
			
			
					_createToolBar: function() {
						// TODO - Add a selector for repeat or non-repeat
						var toolBar = new qx.ui.groupbox.GroupBox();
						toolBar.setLayout(new qx.ui.layout.Flow(10, 10));
					  
						this.sbContinents = this.createCitiesContinentsSelectBox();
						this.sbContinents.addListener("changeSelection", function(evt) {
							this.updateView();
							}, this);
						toolBar.add(this.sbContinents);
					  
						this.sbLevel = new qx.ui.form.SelectBox().set({
							width: 70,
							height: 28
						});
					  
						this.sbLevel.setToolTipText("Filter by: <b>min level</b>");
					  
						var min_level = localStorage.getItem("lou_suite_min_level");
					  
						if (typeof min_level == 'undefined') {
							min_level = 1;
						}
					  
						var levels_list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
					  
						for (var i = 1; i < 10; i++) {
							var item = new qx.ui.form.ListItem("Level " + i, null, i);
							this.sbLevel.add(item);
							if (i == min_level) {
								this.sbLevel.setSelection([item]);
							}
						}
					}
				}
			});



		}
		

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
