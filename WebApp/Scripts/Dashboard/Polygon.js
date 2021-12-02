
let circles = [];
var mouseup = false;
let lineSegments = [];
let polygons = [];
let tempLine = null;
let drawNewPolygon = false;
var startXP = null;
var startYP = null;
let iPolygon = null;
let createDot = false;
let doNotAllowClick = false;
var removedPolygons = [];
let clickedPolygon = {
    indx : -1,
    polygonNo: -1,
    totalVertex: 0,
    vertX: [],
    vertY: []
}

//const AddAct = "A";
//const EditAct = "E";
//const DeleteAct = "D";

class Polygon {
    constructor(id,polygonNo, startX, startY, endX, endY, photoId,action) {
        this.id = id;
        this.polygonNo = polygonNo;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.photoId = photoId;
        this.action = action;
    }
}

class LineSegment {
    constructor(id, polygonNo, x1, y1, x2, y2) {
        this.id = id;
        this.polygonNo = polygonNo;
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
    }
}

function drawPolygon() {

    if (drawNewPolygon) {
        ctx.clearRect(0, 0, 640, 480);
    }

    for (var i = 0; i < lineSegments.length; i++) {

        var p1 = lineSegments[i].x1;
        var p2 = lineSegments[i].y1;
        var p3 = lineSegments[i].x2;
        var p4 = lineSegments[i].y2;

        ctx.strokeStyle = "#ff0000";
        ctx.beginPath();
        ctx.moveTo(p1, p2);
        ctx.lineTo(p3, p4);
        ctx.closePath();

        ctx.stroke();
    }

    if (createDot) {
        drawCircle(startXP, startYP);
    }
}

function drawCircles() {
    for (var i = 0; i < circles.length; i++) {
        drawCircle(circles[i].x, circles[i].y);
    }
}

function drawCircle(x, y, r = 5, color = "#ffff66") {
    ctx.fillStyle = color; //red
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);

    ctx.closePath();
    ctx.fill();
}

function drawTempLine() {

    ctx.clearRect(0, 0, 640, 480);

    var p1 = tempLine.x1;
    var p2 = tempLine.y1;
    var p3 = tempLine.x2;
    var p4 = tempLine.y2;

    drawCircle(p3, p4);

    ctx.beginPath();
    ctx.moveTo(p1, p2);
    ctx.lineTo(p3, p4);
    ctx.closePath();

    ctx.strokeStyle = "#ff0000";
    ctx.stroke();
}

function handleMouseDownPolygon(e) {
    if (!doNotAllowClick) {
        var photoId = $("#PhotoId").val();
        mousedown = true;
        mouseup = false;
        setCanvasOffset();

        if (startXP == null && startYP == null) {
            startXP = parseFloat(e.clientX - offsetXResult);
            startYP = parseFloat(e.clientY - offsetYResult);

            var polygonNo = polygons.length == 0 ? 0 : polygons[polygons.length - 1].polygonNo + 1;
            iPolygon = new Polygon(null, polygonNo, startXP, startYP, startXP, startYP, photoId, AddAct);

            if (checkPolygonOverlap(startXP, startYP)) {

                drawCirclesOnSelectedPolygon(); //this function will draw circles around selected polygon.

                mouseup = false;
                startXP = null;
                startYP = null;
                circles = [];
                drawNewPolygon = true;
                createDot = false;

            }
            else {
                drawNewPolygon = false;
                createDot = true;

                $("#btnDelete").addClass("disabled");
                document.getElementById("btnDelete").disabled = true;

            }          
        }
        else {

            var isSuccess = isPointInsideCircle(5, startXP, startYP, iPolygon.endX, iPolygon.endY);

            if (isSuccess) {
                //var lastLine = {
                //    x1: iPolygon.startX,
                //    y1: iPolygon.startY,
                //    x2: startXP,
                //    y2: startYP
                //}

                var lastLine = new LineSegment(null, iPolygon.polygonNo, iPolygon.startX, iPolygon.startY, startXP, startYP);
                lineSegments.push(lastLine);

                polygons.push(iPolygon);
                mouseup = false;
                startXP = null;
                startYP = null;
                circles = [];
                drawNewPolygon = true;
                createDot = false;

                updateHiddenFieldPolygon();

                drawPolygon();
            }
            else {

                var line = new LineSegment(null,iPolygon.polygonNo, iPolygon.startX, iPolygon.startY, iPolygon.endX, iPolygon.endY);

                iPolygon.startX = iPolygon.endX;
                iPolygon.startY = iPolygon.endY;

                createDot = true;
                drawNewPolygon = false;
                lineSegments.push(line);

                drawPolygon();
            }
        }
    }  
}

function handleMouseMovePolygon(e) {
   
    if (mouseup) {
        iPolygon.endX = parseFloat(e.clientX - offsetXResult);
        iPolygon.endY = parseFloat(e.clientY - offsetYResult);

        if (checkPolygonOverlap(iPolygon.endX, iPolygon.endY)) {
            doNotAllowClick = true;
            //alert("moved inside polygon");
        }
        else {
            doNotAllowClick = false;
           // alert("moved outside polygon");
        }

        //if (circles.length > 0) {
        //    var isSuccess = isPointInsideCircle(5, startXP, startYP, iPolygon.endX, iPolygon.endY);
        //    if (isSuccess) {
        //        console.log("Point is inside circle");
             
        //    }
        //    else {
               
        //    }
        //}

        if (tempLine == null) {

            tempLine = {
                x1: iPolygon.startX,
                y1: iPolygon.startY,
                x2: iPolygon.endX,
                y2: iPolygon.endY
            }
        }
        else {
            tempLine.x2 = iPolygon.endX;
            tempLine.y2 = iPolygon.endY;
        }

        drawTempLine();
        drawPolygon();
    }     
}

function handleMouseUpPolygon(e) {
    mousedown = false;
    tempLine = null;
    mouseup = drawNewPolygon ? false : true;

    iPolygon.endX = parseFloat(e.clientX - offsetXResult);
    iPolygon.endY = parseFloat(e.clientY - offsetYResult);
   
   // drawPolygon();
}

function handleMouseOutPolygon(e) {
    mousedown = false;
}

function updateHiddenFieldPolygon() {
    var jsonStr = polygons.length > 0 ? JSON.stringify(polygons) : "";
    $("#ClientSidePolygonData").val(jsonStr);

    //Enable and disable save button by comparing server and client side changes 
    //if both are equal then no need to enable button but if there are changes then enable it.
    if (!isServerAndClientSideChangesEqual()) {
        $("#btnSave").removeClass("disabled");
        $("#btnRefresh").removeClass("disabled");

        document.getElementById("btnSave").disabled = false;
    }
    else {
        $("#btnSave").addClass("disabled");
        $("#btnRefresh").addClass("disabled");

        document.getElementById("btnSave").disabled = true;
    }
}

function isPolygonOverlap(polygonNo, indexOfPoly,testx, testy) {
    var vertx = []; //array to store x coordinates of the given polygon 
    var verty = []; //array to store y coordinates of the given polygon 
   
    var currentPolygon = lineSegments.filter((lineSegment)=> {
        return lineSegment.polygonNo == polygonNo
    });

    var nvert = currentPolygon.length;  //no of vertices in this polygon

    currentPolygon.forEach(function(item, index){
        var obj = item;
        vertx.push(obj.x1);

        verty.push(obj.y1);
    });

    var i, j, c = false;

    resetClickedPolygon(); //reset clickedPolygon variable

    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        if (((verty[i] > testy) != (verty[j] > testy)) &&
            (testx < (vertx[j] - vertx[i]) * (testy - verty[i]) / (verty[j] - verty[i]) + vertx[i])) {
            c = !c;
            clickedPolygon = {
                indx: indexOfPoly,
                polygonNo: polygonNo,
                totalVertex: nvert,
                vertX: vertx,
                vertY: verty
            };
        }
    }
    return c;
}

function checkPolygonOverlap(testX,testY) {
    if (polygons.length > 0) {
        for (var i = 0; i < polygons.length; i++) {
            if (isPolygonOverlap(polygons[i].polygonNo, i,testX, testY)) {

                console.log("Point is inside polygon :" + polygons[i].polygonNo);
                return true;
            }
        }
    }
    return false;
}

function resetClickedPolygon() {
    clickedPolygon = {
        polygonNo: -1,
        totalVertex:0,
        vertX: [],
        vertY: []
    }
}

function drawCirclesOnSelectedPolygon() {
    circles = [];

    for (var i = 0; i < clickedPolygon.totalVertex; i++) {

        var circleObj = {
            x: clickedPolygon.vertX[i],
            y: clickedPolygon.vertY[i]
        }

        circles.push(circleObj);
    }
    drawPolygon();
    drawCircles();

    $("#btnDelete").removeClass("disabled");
    document.getElementById("btnDelete").disabled = false;
}