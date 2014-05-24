JSData
======



Web Interactive Data Visualization using jQuery, Javascript, and HTML5.

#Global Rules
<ul>
<li> All Data objects must be initialized through their respective jQuery functions AFTER the document is ready (within the document.ready function like in the test.html file)</li>
<li> All data-point's colors are determined by the "color" attribute in their CSS style </li>
</ul>

#Classes
##Data-Pie
Initialization:
```javascript
$("#myPieDiv").pie();
```

####Data Value Attribute Structure:
`data-val="x"`
#####Example:

    <span class="data-point" data-val="5"></span>
    <span class="data-point" data-val="2.7"></span>


####Data Attributes:
<table>
<tr>
<th>Name</th><th>Purpose</th><th>Input Options</th><th>Default</th>
</tr>

<tr>
<td>data-pie-show-text</td><td>Show Text on hover</td><td>true or false</td><td>true</td>
</tr>

<tr>
<td>data-pie-hover-sticky</td><td>Keep the segment hovered even after exit</td><td>true or false</td><td>false</td>
</tr>

</table>

###HTML Example:
    <div class="data-pie" id="myPieDiv" data-pie-show-text="true"
        style="width:500px;500px;"></div>

##Data-ScatterGraph
Initialization:
    javascript
    $("#myScatterGraph").scattergraph();
    
####Data Value Attribute Structure:
    data-val="x,y"
#####Example:
    <span class="data-point" data-val="2.5,3.7"></span>


###Data Attributes:
<table>

<tr>
<th>None</th>
</tr>

</table>

###HTML Example:
    <div class="data-scattergraph" id="myScatterGraph" 
        style="width:500px;500px;"></div>

#Functions

##bindDataPoint(element)

####Purpose:
Binds the object's data-val attribute to the element's value
####Example:
    $("#testPoint").bindDataPoint($("#bindBox"));


##bindDataPoint(eventData,element)

####Purpose:
Binds the object's data-val attribute to the element's value that updates on eventData
####Example:
	$("#secondTest").bindDataPoint("keyup",$("#bindBox2"));


