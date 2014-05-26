/* Author: Brandon Layton
 * 
 * JSData-core.js
 * 
 * 
 */

//non-conflict
(function($){
	
	this.Data = []

	//utility functions

	//Takes borders into consideration
	function getOffset(e){
		var x = 0, y = 0;
	    x += parseInt(e.offset().left);
	    y += parseInt(e.offset().top) ;
	    x += parseInt(e.css("border-left-width"));
	    y += parseInt(e.css("border-top-width"));
	    return { x: x, y: y };
	}
	//Simple function that draws a line on the c context from s to e
	//s and e are arrays with x and y coordinates
	function strokeLine(c,s,e){
		c.beginPath();
		c.moveTo(s[0],s[1]);
		c.lineTo(e[0],e[1]);
		c.stroke();
	}
	//checks to see if element is already a Data Object
	function isInDataArray(element){
		for(var d in Data){
			if(Data[d].element == this) //find the corresponding Data object
				return true;
		}
		return false;
	}
	//clamps a to min b and max c
	function clamp(a,b,c){
		return Math.max(b,Math.min(c,a));
	}
	//round a to the nearest n multiple
	function round(a,n){
		return Math.round(a/n)*n;
	}
	
	function Pie(ele){
		var element = ele;
		element.prepend("<canvas class='data-pie-canvas' width='"+element.width()+"' height='"+element.height()+"'></canvas>");
		
		//Time to do some defaulting
		if(!element.attr("data-pie-show-text"))    element.attr("data-pie-show-text","true");
		if(!element.attr("data-pie-hover-sticky")) element.attr("data-pie-hover-sticky","false");
		
		var radiusFactor = 3; //just used instead of a hard-coded number so you can edit (shouldn't be any less than 2 though)
		var radiusHoverEnlarge = 4;
		
		//this function is extremely similar to Draw
		//Excluding the drawing...
		//Trying to do collision detection with data that 
		//Isn't readily available that also falls into portions 
		//of a circle.
		element.mousemove(function( event ){
			var x = event.pageX - element.offset().left,
				y = event.pageY - element.offset().top ;
			var pie = element.find(".data-pie-canvas");
			var w = pie.width(), h = pie.height(),
				r = (w > h ? w : h)/radiusFactor;
			var total = 0,
				points = [],
			    curAngle = 0;
			//The distance from the center
			var dX = x - w/2,
				dY = h/2 - y;
			//If the squared distance is bigger than the squared radius then it is not even in the circle
			if((dX*dX + dY*dY) > r*r){
				if(element.attr("data-pie-hover-sticky")=="false"){//since attributes are strings
					element.attr("data-hovered",-1);
				}
				return;
			} 
			//Grab data
			element.find(".data-point").each(function(){
				var val = parseInt($(this).attr("data-val"),10);
				total += val;
				points.push(val);
			});
			//see if the point is in a certain segment
			//If already in the circle, then we can make some assumptions about the point
			//Since we are looking at it from a counter clockwise perspective.
			//If the angle to the clicking point is less than the current angle, then it is within that segment
			for(var p in points){
				var perc 	= points[p]/total,
					theta	= Math.PI*2*perc,
					angleTo = curAngle + theta;
				
				var fi = Math.atan2(dY,dX);//angle of our vector relative to the x-axis
				if(fi < 0) fi += Math.PI * 2;//shift everything into the domain where 2pi>x>0
				fi = -(fi - Math.PI * 2);//Flip it so that it is counter clockwise (normal it's CW)
				if(fi <= angleTo && fi >= curAngle){
					element.attr("data-hovered",p);//set our data
					return;
				}
				
				curAngle = angleTo;
			}
		});
		
		//Draws the pie
		function Draw(){
			var god = element;
			var pie = god.find(".data-pie-canvas");
			pie.width(god.width()); pie.height(god.height());
			var piec= pie.get(0).getContext("2d");
			var total = 0,
				points = [],
			    curAngle = 0,
			    colors = [];
			var w = pie.width(), h = pie.height(),
				r = (w > h ? w : h)/radiusFactor;
			var hoveredAngleStart = -1, hoveredAngleEnd = -1;
			var hoveredIndex = parseInt(god.attr("data-hovered"),10);
			
			//Context initializing
			piec.imageSmoothingEnabled = true;
			piec.lineCap     = "round";
			piec.strokeStyle = "#222";
			piec.lineWidth   = 2;
			piec.clearRect(0,0,w,h); //clear canvas
			
			//grab the data points
			god.find(".data-point").each(function(){
				var val = parseFloat($(this).attr("data-val"),10);
				total += val;
				points.push(val);
				colors.push($(this).css("color"));
			});

			//plot the data points
			for(var p in points){
				piec.fillStyle = colors[p]; //set the color
				
				var perc = points[p]/total; //find the percentage
				var angleTo = curAngle + Math.PI*2*perc; //find the angle we need to move to
				
				piec.beginPath(); //start the path
				piec.moveTo(w/2,h/2); //move to the center of the circle
				piec.arc(w/2,h/2,r,curAngle,angleTo); //arc the path from the angle we are at to the angle we need to be
				piec.fill(); //fill the path
				if(hoveredIndex == p){
					hoveredAngleStart = curAngle;
					hoveredAngleEnd   = angleTo;
				}
				piec.lineTo(w/2,h/2);
				piec.stroke();//stroke the arc as well as fill it
				
				curAngle = angleTo; //shift over our current angle
			}
			
			if(hoveredAngleStart != -1 && hoveredAngleEnd != -1){
				piec.fillStyle = colors[hoveredIndex]; //set the color
				piec.beginPath(); //start the path
				var perc = points[hoveredIndex]/total; //find the percentage
				
				piec.moveTo(w/2,h/2);
				piec.arc(w/2,h/2,r+radiusHoverEnlarge,hoveredAngleStart,hoveredAngleEnd);
				piec.lineTo(w/2,h/2);
				piec.fill();
				
				piec.stroke();
				
				if(god.attr("data-pie-show-text") != "false")
				{
					//Text
					piec.font = "14px Arial Bold";
					piec.fillStyle = "#111";
					var text = points[hoveredIndex] + " (" + parseFloat(perc*100).toFixed(2) + "%)";
					var textSize = piec.measureText(text);
					//the middle + the mid way point between the angles, then compensate for the text's size
					//the r/2 brings the text closer to the middle of the circle
					var textX = w/2 + (r/2)*Math.cos(hoveredAngleStart + (hoveredAngleEnd - hoveredAngleStart)/2) - textSize.width/2,
						textY = h/2 + (r/2)*Math.sin(hoveredAngleStart + (hoveredAngleEnd - hoveredAngleStart)/2) + 20;
					piec.fillText(text, textX, textY);
				}
			}
		};
		
		Draw(); //initially draw the graph
		UpdateInterval = setInterval(Draw, 25);
	};

	//SCATTER GRAPH
	var ScatterGraph = function(ele){
		//So we can call self from functions
		var self = this;
		this.element = ele;
		this.element.prepend("<canvas class='data-scattergraph-canvas' width='"+this.element.width()+"'"+
			" height='"+this.element.height()+"'></canvas>");

		if(!this.element.attr("data-graph-ticks")) this.element.attr("data-graph-ticks","true");
		if(!this.element.attr("data-graph-tickIncrement")) this.element.attr("data-graph-tickIncrement","5");
		if(!this.element.attr("data-graph-snapping")) this.element.attr("data-graph-snapping","false");

		//Variable initializations
		this.pointSize = 10;//the diameter of each point
		this.pointHoverEnlargeFactor = 2; //2x the size when hovered
		this.unitsPerX = 1.0; //variables for controlling the drawing of the graph
		this.unitsPerY = 1.0;
		this.offsetX    = 0;
		this.offsetY    = 0;
		this.dashesX    = 15;
		this.dashesY    = 15;

		this.colors = [];
		this.dataPoints = [];
		this.clickedData = -1;
		this.minX = 0; this.maxX = 0;
		this.minY = 0; this.maxY = 0;
		//For some reason it wouldn't take it without it being in a subfunction.
		//Should look into that later
		this.element.mousemove(function(event){ self.handlemousemove(event); });
		this.element.mousedown(function(event){ self.handlemousedown(event); });
		this.element.mouseup(  function(event){ self.handlemouseup(event);   });
		this.element.bind('mousewheel DOMMouseScroll', function(event){ self.handlemousewheel(event); });

		//Alt key speeds up the scrolling/zooming
		this.handlemousewheel = function(event){
			var damp = event.altKey ? 20 : 100
			var accelY = (event.originalEvent.deltaY)/damp,
			 	accelX = (event.originalEvent.deltaX)/damp;	
			
			if(event.ctrlKey){//Zoom

				var inc  = 100/parseFloat(self.element.attr("data-graph-tickIncrement"));
				this.unitsPerX += accelX*0.01;
				this.unitsPerY += accelY*0.01;
				this.unitsPerX = clamp(this.unitsPerX,0,2);
				this.unitsPerY = clamp(this.unitsPerY,0,2);
			}	
			//Even if we are zooming, this makes the graph stay more in the middle
			//It's flipped because of Delta
			self.offsetX -= accelX;
			self.offsetY -= accelY;
			
			//Make it so the page doesn't scroll as well
			event.preventDefault();
		};
		this.handlemousedown = function(event){
			var god = self.element;
			var o = getOffset(self.element);
			var x = event.pageX - o.x,
				y = event.pageY - o.y;
			var w = self.element.width(),
				h = self.element.height();
			var r = self.pointSize/2;
			//actual values on graph
			var aX = self.unitsPerX * x     + self.offsetX,
				aY = self.unitsPerY * (h-y) + self.offsetY;

			for(var i = 0; i < self.dataPoints.length; i++){
				var p = self.dataPoints[i];
				var pX = (p[0] - self.offsetX)*(1/self.unitsPerX),
					pY = h + (self.offsetY - p[1])*(1/self.unitsPerY);
				
				var dX = pX - x, dY = pY - y;
				if(dX*dX + dY*dY < r*r){
					self.clickedData = i;
					return;
				}

			}
		};
		this.handlemouseup = function(event){ self.clickedData = -1;}
		this.handlemousemove = function(event){
			if(self.clickedData == -1) return; //If nothing clicked
			var god = self.element;
			var o = getOffset(self.element);
			var x = event.pageX - o.x,
				y = event.pageY - o.y;
			var w = self.element.width(),
				h = self.element.height();
			//actual values on graph
			var aX = self.unitsPerX * x     + self.offsetX,
				aY = self.unitsPerY * (h-y) + self.offsetY;
			if(self.element.attr("data-graph-snapping") == "true"){
				var snap = parseFloat(self.element.attr("data-graph-tickIncrement"));
				aX = round(aX,snap);
				aY = round(aY,snap);
			}
			var i = 0;
			god.find(".data-point").each(function(){
				if(i == self.clickedData){
					$(this).attr("data-val",aX+","+aY);
				}
				i++;
			});
		};
		this.update = function(){
			var god = self.element;
			var minX = null, maxX = null,
				minY = null, maxY = null;
			self.dataPoints = []; //clear data
			self.colors = [];
			god.find('.data-point').each(function(){
				var val = $(this).attr("data-val");
				var vals= val.split(",");
				var valX = parseFloat(vals[0],10),
					valY = parseFloat(vals[1],10);
				//Initialize the min and max or set the new one
				if(minX == null || valX < minX) minX = valX;
				if(maxX == null || valX > maxX) maxX = valX;
				if(minY == null || valY < minY) minY = valY;
				if(maxY == null || valY > maxY) maxY = valY;

				self.dataPoints.push([valX,valY]);
				self.colors.push($(this).css("color"));
			});

			self.minX = minX; self.maxX = maxX;
			self.minY = minY; self.maxY = maxY;
		};
		this.fit = function(){
			self.update();
			var god = self.element;
			var w = god.width(),
				h = god.height();

			self.offsetX = self.minX - 0.075;
			self.offsetY = self.minY - 0.075;

			self.unitsPerX = (self.maxX - self.minX)/(w-15); //just a bit of buffer so we aren't ontop
			self.unitsPerY = (self.maxY - self.minY)/(h-15); //of the border
		};
		this.Draw = function(){
			self.update();
			var god = self.element;
			var graph = god.find(".data-scattergraph-canvas");
			graph.width(god.width()); graph.height(god.height());
			var cntxt = graph.get(0).getContext("2d");
			var w = graph.width(),
				h = graph.height();
			var r = self.pointSize/2;

			//Context initialization
			cntxt.font = "10pt Arial";
			cntxt.imageSmoothingEnabled = true;
			cntxt.lineCap     = "round";
			cntxt.strokeStyle = "#222";
			cntxt.lineWidth   = 2;
			cntxt.clearRect(0,0,w,h); //clear canvas

			//actual offset
			var xO = self.offsetX * (1/self.unitsPerX),
				yO = self.offsetY * (1/self.unitsPerY);
			//console.log(unitsPerX+","+unitsPerY);
			var y = h + yO;
			var x = -xO;

			for(var i in self.dataPoints){
				var p = self.dataPoints[i];
				//console.log(r);
				cntxt.fillStyle = self.colors[i];
				cntxt.beginPath();
				cntxt.arc(x + p[0]*(1/self.unitsPerX), y - p[1]*(1/self.unitsPerY),r,0,Math.PI*2);
				cntxt.fill();
			}
			//Lines
			strokeLine(cntxt,[x,0],[x,h]);
			strokeLine(cntxt,[0,y],[w,y]);
			//Ticks
			if(self.element.attr("data-graph-ticks")=="true"){
				var inc = parseFloat(self.element.attr("data-graph-tickIncrement"),10);
				var xInc = (1/self.unitsPerX) * inc,
					yInc = (1/self.unitsPerY) * inc;
				var cX = x, cY = y;
				while(cX < w){ cX+=xInc; strokeLine(cntxt,[cX,y-2],[cX,y+2]); }
				cX = x;
				while(cX > 0){cX-=xInc; strokeLine(cntxt,[cX,y-2],[cX,y+2]); }

				while(cY < h){cY+=yInc; strokeLine(cntxt,[x-2,cY],[x+2,cY]); }
				cY = y;
				while(cY > 0){cY-=yInc; strokeLine(cntxt,[x-2,cY],[x+2,cY]); }
			}
		};

		this.fit();
		this.Draw();
		this.UpdateInterval = setInterval(this.Draw,25);
	};
	

	//function to create the pie initializer in jQuery
	$.fn.pie = function(){
		if(isInDataArray(this))
		{
			return this;
		}
		Data.push(new Pie(this));
		return this;//must return the object so it can have chained functions
	};
	//function to create the scatter graph initializer in jQuery
	$.fn.scattergraph = function(){
		if(isInDataArray(this))
		{
			console.log(this + " is already in the Data Array");
			return this;
		}
		Data.push(new ScatterGraph(this));
		return this;
	};

	$.fn.fit = function(){
		//If the type of object doesn't have this function,
		if(!(
			this.attr("class") == "data-scattergraph"
			))
		{
			console.log("not right data type to call fit()");
			return this;
		}
		for(var d in Data){
			if(Data[d].element == this){ //find the corresponding Data object
				console.log(Data[d]);
				Data[d].fit();
				return this;
			}
		}

		return this;
	};
	
	//This function binds the data-point to the otherElement's val
	//bindDataPoint(element)
	//bindDataPoint(eventData, element)
	$.fn.bindDataPoint = function(){
		if(arguments.length == 0) return this; //no default function

		var god = $(this);
		var handler = function(){
				var val = $(this).val();
				if(!val) val = 0;
				god.attr("data-val",val);
			};

		var element   = arguments.length == 1 ? arguments[0] : arguments[1];
		var eventData = arguments.length == 1 ? "change" : arguments[0];

		element.on(eventData,handler);

		return this;
	};

	$.fn.addDataPoint = function(){
		if(arguments.length == 0) return this;
		var value = arguments[0];
		var color = arguments.length == 2 ? arguments[1] : "#DD0000";
		$(this).append(
			"<span class='data-point' style='color: " + color + "' "+
			"data-val='" + value + "'></span>"
			);
		return this;
	}
}(jQuery));
