//Antares Rahman 6/26/15
//methods.js describes the various methods used in ImageFilters
//alongside methods in rgb-hsv_converter.js
//NOTE: COMMENTED drawWheel() function at end!

//initialize values for the sliders [drawBars()]
var INITVAL = 0.5;
var rangeValue = 0.5;

//initialize for filter() 
//var filter1 = [0.5, 0, 0];
//var filter2 = [0.5, 0, 0];
//var filter3 = [0.5, 0, 0];

//initialize for clearRect() in selectSrcImg()
//var w = 500;
//var h = 500;
//var stX = 0;
//var stY = 0;


//populates the image list on the select options
//invoked when page loads
function populateImgList() {
  var xmlhttp=new XMLHttpRequest( );
  xmlhttp.onreadystatechange=function( ){
    if (xmlhttp.readyState==4 && xmlhttp.status==200) {
      var xmlDoc = xmlhttp.responseXML;
      var title;
      var options = "";

      for (var i=0; i<7; i++) {
        title = xmlDoc.getElementsByTagName("title")[i].childNodes[0].nodeValue;
        options = options+"<option value=\""+title+"\">"+title+"</option> ";
      }

      document.getElementById("img-select").innerHTML = options;
    }  
  }
  xmlhttp.open("GET","images.xml",true);
  xmlhttp.send();
}

//updates values for the filters
//invoked when range filter is altered
function showValue(newValue){
  rangeValue = newValue;
  filter1 = drawBars(filter1[0], "myCanvas1");
  filter2 = drawBars(filter2[0], "myCanvas2");
  filter3 = drawBars(filter3[0], "myCanvas3");
}

//draws the bars on the color wheels
//invoked at start,
//and whenever the filter values are altered
//returns
//  newValue: new value on slider (avg of low/high)
//  lowVal: newValue - 0.5*range
//  highVal: highValue + 0.5*range
function drawBars(newValue, myCanvas) {
  var canv=document.getElementById(myCanvas);
  var c=canv.getContext("2d");
  c.clearRect(0, 0, canv.width, canv.height);
  var center = canv.width/2;
  
  var range = rangeValue*2*Math.PI*(170/360)/2;
  var midVal = newValue*2*Math.PI+(Math.PI/2); // - (newValue*range)
  var lowVal = midVal - range - Math.PI/4;
  var highVal = midVal + range - Math.PI/4;
  
  //draw the lines
  for (var i=0; i<3; i++) { //loop darkens the lines
    c.beginPath();
    c.moveTo(center,center);
    c.lineTo(center*(1+Math.cos(lowVal)),center*(1+Math.sin(lowVal)));
    c.strokeStyle = "white";
    c.stroke();
  
    c.beginPath();
    c.moveTo(center,center);
    c.lineTo(center*(1+Math.cos(highVal)),center*(1+Math.sin(highVal)));
    c.strokeStyle = "black";
    c.stroke();
  }
  
  lowVal = (lowVal-Math.PI/4)/(2*Math.PI);
  highVal = (highVal-Math.PI/4)/(2*Math.PI);
  
  if (lowVal<0) {
    lowVal = 1 + lowVal;
  } 
  else if (highVal>1) {
    highVal = highVal - 1;
  }
//  alert(lowVal+", "+highVal);
  
  //return values for use in filteration and range alteration
  //values used in showValue() and filter()
  return [newValue, lowVal, highVal];
}

//draws the source and output images
//on their respective canvas
//invoked at start and whenever new image is selected
function selectSrcImg() {
    var xmlhttp=new XMLHttpRequest( );
    xmlhttp.onreadystatechange=function( ) {
      if (xmlhttp.readyState==4 && xmlhttp.status==200) {
        var xmlDoc = xmlhttp.responseXML;
        var i=-1;
        var element = document.getElementById("img-select");
        var curTitle = element.options[element.selectedIndex].value;
        var selTitle;

        while (selTitle != curTitle) {
          i++;
          selTitle = xmlDoc.getElementsByTagName("title")[i].childNodes[0].nodeValue;
        }
        var sourcePath = xmlDoc.getElementsByTagName("fileName")[i].childNodes[0].nodeValue;
        
        var canvas=document.getElementById("srcCanvas");
        var c=canvas.getContext("2d");
        var outCanvas=document.getElementById("outCanvas");
        var outC=outCanvas.getContext("2d");

        var ratio;

        outC.clearRect(0,0,outCanvas.width,outCanvas.height);
        c.clearRect(0,0,canvas.width,canvas.height);
        
        var img = new Image();
        img.onload = function() {
          ratio = Math.min(canvas.width/this.width, canvas.height/this.height);
          w = ratio*this.width;
          h = ratio*this.height;
          stX = (canvas.width - w)/2;
          stY = (canvas.height - h)/2;
          c.drawImage(img, stX, stY, w, h);
          
          //
          var myname = document.getElementById("myname");
          myname.style.marginLeft = stX+10;
          myname.style.marginTop = stY+10;
          
          //
          var myname = document.getElementById("imgtitle");
          myname.innerHTML = selTitle;
          myname.style.marginLeft = stX+10;
          myname.style.marginTop = stY+10;
        }
        img.src = "images/"+sourcePath;
      }
    }
    xmlhttp.open("GET","images.xml",true);
    xmlhttp.send();

}

//filters the source image, and displays filtered image
//invoked on clicking the filter button
function filter() {
  var srcCanvas=document.getElementById("srcCanvas");
  var srcC=srcCanvas.getContext("2d");
  var outCanvas=document.getElementById("outCanvas");
  var outC=outCanvas.getContext("2d");
  
  outC.clearRect(0,0,outCanvas.width,outCanvas.height);
  
  var option1 = document.getElementById("option1");
  var option2 = document.getElementById("option2");
  var option3 = document.getElementById("option3");
        
  var srcW = srcCanvas.width;
  var srcH = srcCanvas.height;
  
  var srcData = srcC.getImageData(0, 0, srcW, srcH);
  var srcPix = srcData.data;
  var outData = outC.createImageData(srcW, srcH);
  var outPix = outData.data;
  
//  alert(srcPix[0]+","+srcPix[1]+","+ srcPix[2]);
  
  var h_HSV;
  var draw = false;
  for (var i=0; i<srcPix.length; i+=4) { 
    h_HSV = rgbToHsv(srcPix[i], srcPix[i+1], srcPix[i+2])[0];

    //
    if (option1.checked) {
      if (filter1[1] > filter1[2]) {
        if ((0 <= h_HSV && h_HSV <= filter1[2]) || (filter1[1] <= h_HSV && h_HSV <= 1))
          draw = true;
      }
      else {
        if (filter1[1] <= h_HSV && h_HSV <= filter1[2])
          draw = true;
      }
    }
    //
    if (option2.checked) {
      if (filter2[1] > filter2[2]) {
        if ((0 <= h_HSV && h_HSV <= filter2[2]) || (filter2[1] <= h_HSV && h_HSV <= 1))
          draw = true;
      }
      else {
        if (filter2[1] <= h_HSV && h_HSV <= filter2[2])
          draw = true;
      }
    }
    //
    if (option3.checked) {
      if (filter3[1] > filter3[2]) {
        if ((0 <= h_HSV && h_HSV <= filter3[2]) || (filter3[1] <= h_HSV && h_HSV <= 1))
          draw = true;
      }
      else {
        if (filter3[1] <= h_HSV && h_HSV <= filter3[2])
          draw = true;
      }
    }
    
    if (draw) {
      outPix[i  ] = srcPix[i  ]; 	// red channel
      outPix[i+1] = srcPix[i+1];  	// blue channel
      outPix[i+2] = srcPix[i+2];  	// green channel
      outPix[i+3] = 255; 	        // alpha channel
    }
    draw = false;
  }		
//  }
  
  outC.putImageData(outData, 0, 0);
}

//NOTE!!!
//method draws the HSV spectrum color-wheel
//a static image has been used instead
//because the image is loaded faster and looks prettier
//should be invoked at start
//function drawWheel(myCanvas) {
//  var canv=document.getElementById(myCanvas);
//  var c=canv.getContext("2d");
//  var center = canv.width/2;
//  var rgbVal;
//  
//  for(var angle=0; angle<360; angle+=0.5) {
//    rgbVal = hsvToRgb(angle/360, 1, 1);
//    c.beginPath();
//    c.moveTo(center+30*(Math.cos(angle*Math.PI/180)),center+30*(Math.sin(angle*Math.PI/180)));
//    c.lineTo(center*(1+Math.cos(angle*Math.PI/180)),center*(1+Math.sin(angle*Math.PI/180)));
//    c.strokeStyle = "rgb("+rgbVal[0]+","+rgbVal[1]+","+rgbVal[2]+")";
//    c.stroke();
//  }
//  
//  var center = canv.width/2;
//  var rgbVal, startAngle, endAngle;
//
////  for (var radius=30; radius<=center; radius+=0.5) {
//    for(var angle=0; angle<=360; angle+=1){
//      startAngle = angle*Math.PI/180;
//      endAngle = (angle+2) * Math.PI/180;
//      rgbVal = hsvToRgb(angle/360, 1, 1);
//      c.beginPath();
//      c.moveTo(center, center);
//      c.arc(center,center,center,startAngle,endAngle);
//        c.fillStyle = "rgb("+rgbVal[0]+","+rgbVal[1]+","+rgbVal[2]+")";
////      c.strokeStyle = "rgb("+rgbVal[0]+","+rgbVal[1]+","+rgbVal[2]+")";
//        c.fill();
////      c.stroke();
//      c.closePath();
//    }
////  }
//}