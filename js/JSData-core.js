/* Author: Brandon Layton
 * 
 * JSData-core.js
 * 
 * 
 */

//non-conflict
(function($){
	
	this.Pies = [];
	
	function Pie(ele){
		var element = ele;
		element.prepend("<canvas class='data-pie-canvas' width='"+element.width()+"' height='"+element.height()+"'></canvas>");
		
		//Time to do some defaulting
		if(!element.attr("data-pie-show-text"))
			element.attr("data-pie-show-text","true");
		if(!element.attr("data-pie-hover-sticky"))
			element.attr("data-pie-hover-sticky","false");
		
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
			var w = pie.attr("width"), h = pie.attr("height"),
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
				
				var fi = Math.atan2(dY,dX);
				if(fi < 0) fi += Math.PI * 2;
				//Flip it so that it is counter clockwise
				fi = -(fi - Math.PI * 2);
				if(fi <= angleTo){
					element.attr("data-hovered",p);
					return;
				}
				
				curAngle = angleTo;
			}
		});
		
		//Draws the pie
		function Draw(){
			var god = element;
			var pie = god.find(".data-pie-canvas");
			var piec= pie.get(0).getContext("2d");
			var total = 0,
				points = [],
			    curAngle = 0,
			    colors = [];
			var w = pie.attr("width"), h = pie.attr("height"),
				r = (w > h ? w : h)/radiusFactor;
			var hoveredAngleStart = -1, hoveredAngleEnd = -1;
			var hoveredIndex = parseInt(god.attr("data-hovered"),10);
			
			piec.imageSmoothingEnabled = true;
			
			//grab the data points
			god.find(".data-point").each(function(){
				var val = parseInt($(this).attr("data-val"),10);
				total += val;
				points.push(val);
				colors.push($(this).css("color"));
			});
			piec.clearRect(0,0,w,h); //clear canvas
			piec.strokeStyle = "#222";
			piec.lineWidth = 2;
			//plot the data points
			for(var p in points){
				piec.fillStyle = colors[p]; //set the color
				piec.beginPath(); //start the path
				
				var perc = points[p]/total; //find the percentage
				var angleTo = curAngle + Math.PI*2*perc; //find the angle we need to move to
				piec.moveTo(w/2,h/2); //move to the center of the circle
				piec.arc(w/2,h/2,r,curAngle,angleTo); //arc the path from the angle we are at to the angle we need to be
				piec.fill(); //fill the path
				if(hoveredIndex == p){
					hoveredAngleStart = curAngle;
					hoveredAngleEnd   = angleTo;
				}
				piec.lineTo(w/2,h/2);
				piec.stroke();
				
				
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
				
				piec.strokeStyle = "#222";
				piec.lineWidth = 3;
				piec.stroke();
				
				if(god.attr("data-pie-show-text") != "false")
				{
					//Text
					piec.font = "14px Arial Bold";
					piec.fillStyle = "#111";
					//the middle + the mid way point between the angles, then compensate for the text's size
					//the r/2 brings the text closer to the middle of the circle
					var textX = w/2 + (r/2)*Math.cos(hoveredAngleStart + (hoveredAngleEnd - hoveredAngleStart)/2) - 30,
						textY = h/2 + (r/2)*Math.sin(hoveredAngleStart + (hoveredAngleEnd - hoveredAngleStart)/2) + 16;
					piec.fillText(points[hoveredIndex] + " (" + parseFloat(perc*100).toFixed(2) + "%)", 
						 textX,
						 textY);
				}
			}
		};
		
		Draw(); //initially draw the pie graph
		UpdateInterval = setInterval(Draw, 25);
	};
	//Override function to create the pie initializer
	$.fn.pie = function(){
		Pies.push(new Pie(this));
		return this;//must return the object so it can have chained functions
	};
	
}(jQuery));
