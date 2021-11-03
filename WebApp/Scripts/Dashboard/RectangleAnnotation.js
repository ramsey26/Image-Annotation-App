let boxes = [];
let ctx = "";
let mousedown = false;
let startX;
let startY;
let clickedArea = { box: -1, pos: 'o' };
let tmpBox = null;
let lineOffset = 4;
let anchrSize = 4;
let boxEdgeOffset = 30;
let iCanvas = null;
let offsetXResult;
let offsetYResult;
let offsetX;
let offsetY;
var $canvas = "";
var removedBoxes = [];

var polygonFlag = false;

const AddAct = "A";
const EditAct = "E";
const DeleteAct = "D";

var selectedBoxIndex = -1;

class Box {
    constructor(id, x1, x2, y1, y2, angle, boundingBoxNumber, photoId, action) {
        this.id = id;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.angle = angle;
        this.boundingBoxNumber = boundingBoxNumber;
        this.width = this.x2 - this.x1;
        this.height = this.y2 - this.y1;
        this.xCenter = this.x1 + (this.width) / 2;
        this.yCenter = this.y1 + (this.height) / 2;
        this.photoId = photoId;
        this.action = action;
    }

    doesBoxAreaExists() {
        if (this.width >= boxEdgeOffset && this.height >= boxEdgeOffset) {
            return true;
        }
        return false;
    }

    drawBoxOn() {
        if (this.angle != null) {
            this.rotateBox();
        }
        else {
            ctx.beginPath();
            ctx.strokeStyle = "#ff0000";
            ctx.rect(this.x1, this.y1, (this.x2 - this.x1), (this.y2 - this.y1));
            ctx.closePath();
            ctx.stroke();

            this.renderTextLabel();
        }
    }

    drawEdgeOnSelectedBox() {
      
        ctx.fillStyle = "#ffff66";
        ctx.beginPath();
        ctx.fillRect(this.x1 - anchrSize, this.y1 - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.fillRect(this.x1 - anchrSize, this.yCenter - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.fillRect(this.x1 - anchrSize, this.y2 - anchrSize, 2 * anchrSize, 2 * anchrSize);
        //ctx.fillRect(xCenter - anchrSize, rectBox.y1 - anchrSize, 2 * anchrSize, 2 * anchrSize); // Top center

        ctx.fillRect(this.xCenter - anchrSize, this.y2 - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.fillRect(this.x2 - anchrSize, this.y1 - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.fillRect(this.x2 - anchrSize, this.yCenter - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.fillRect(this.x2 - anchrSize, this.y2 - anchrSize, 2 * anchrSize, 2 * anchrSize);
        ctx.closePath();

        //Draw a circle on top center point
        ctx.fillStyle = "#ffff66"; //red
        ctx.beginPath();
        ctx.arc(this.xCenter, this.y1 - 20, 2 * anchrSize, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
    }

    renderTextLabel() {

        let fontSizePara = getFontSizeForText(this.x1, this.y1, this.x2, this.y2);
        ctx.fillStyle = "#ffff66";
        ctx.font = fontSizePara[0] + "px Arial";

        ctx.fillText(this.boundingBoxNumber, fontSizePara[1], fontSizePara[2]);
    }

    initializeRotation() {
        this.angle = angle(this.xCenter, this.y1, iCanvas.endX, iCanvas.endY);
    }

    rotateBox() {
        if (this.id != null) {
          UpdateBoxEditAction();
        }
        
        // first save the untranslated/unrotated context
        ctx.save();

        ctx.beginPath();
        // move the rotation point to the center of the rect
        ctx.translate(this.xCenter, this.yCenter);

        // rotate the rect
        // ctx.rotate(box.angle * Math.PI / 180);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.strokeStyle = "#ff0000";
        // draw the rect on the transformed context
        // Note: after transforming [0,0] is visually [x,y]
        //       so the rect needs to be offset accordingly when drawn
        ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        // ctx.rect(box.x1, box.y1, width, height);
        ctx.closePath();
        ctx.stroke();

        //var getIndex = function (item) {
        //    return item.boundingBoxNumber == boxes[clickedArea.box].boundingBoxNumber;
        //}

        //var indexNo = boxes.findIndex(getIndex);

        if (clickedArea.box != -1) {
            if (boxes[clickedArea.box].boundingBoxNumber == this.boundingBoxNumber) {
                drawEdgeOnRotatedBox(-this.width / 2, -this.height / 2, this.width, this.height);
            }
        }

        //Render lable
        let fontSizePara = getFontSizeForText(-this.width / 2, -this.height / 2, this.width / 2, this.height / 2);
        ctx.fillStyle = "#ffff66";
        ctx.font = fontSizePara[0] + "px Arial";
        // ctx.fillText(box.boundingBoxNumber, -width / 2 + 10, -height / 2 + 30);
        ctx.fillText(this.boundingBoxNumber, fontSizePara[1], + fontSizePara[2]);
        // restore the context to its untranslated/unrotated state
        ctx.restore();
    }
}

class Canvas {
    constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
    }

    getSelectedBox() {
        var i = clickedArea.box;
        return new Box(boxes[i].id, boxes[i].x1, boxes[i].x2, boxes[i].y1, boxes[i].y2,
            boxes[i].angle, boxes[i].boundingBoxNumber, boxes[i].photoId, boxes[i].action);
    }

    findCurrentArea() {
        for (var i = 0; i < boxes.length; i++) {
            var box = new Box(boxes[i].id, boxes[i].x1, boxes[i].x2, boxes[i].y1, boxes[i].y2, boxes[i].angle, boxes[i].boundingBoxNumber, boxes[i].photoId, boxes[i].action);
            var xCenter = box.xCenter;
            var yCenter = box.yCenter;
          
                if (box.angle == null) {
                    if (box.x1 - lineOffset < this.startX && this.startX < box.x1 + lineOffset) {
                        if (box.y1 - lineOffset < this.startY && this.startY < box.y1 + lineOffset) {
                            return { box: i, pos: 'tl' };    //tl : top left
                        } else if (box.y2 - lineOffset < this.startY && this.startY < box.y2 + lineOffset) {
                            return { box: i, pos: 'bl' };       //bl : bottom left
                        } else if (yCenter - lineOffset < this.startY && this.startY < yCenter + lineOffset) {
                            return { box: i, pos: 'l' };    //l : left
                        }
                    } else if (box.x2 - lineOffset < this.startX && this.startX < box.x2 + lineOffset) {
                        if (box.y1 - lineOffset < this.startY && this.startY < box.y1 + lineOffset) {
                            return { box: i, pos: 'tr' };   //tr : top right
                        } else if (box.y2 - lineOffset < this.startY && this.startY < box.y2 + lineOffset) {
                            return { box: i, pos: 'br' };   //br : bottom right
                        } else if (yCenter - lineOffset < this.startY && this.startY < yCenter + lineOffset) {
                            return { box: i, pos: 'r' };    //r : right
                        }
                    }
                    else if (isPointInsideCircle(2 * lineOffset, this.startX, this.startY, xCenter, box.y1 - 20)) {
                        return { box: i, pos: 'c' } //Position inside circle
                    }
                    else if (xCenter - lineOffset < this.startX && this.startX < xCenter + lineOffset) {
                        //if (box.y1 - lineOffset < y && y < box.y1 + lineOffset) {
                        //    return { box: i, pos: 't' };    //t : top
                        //}
                        if (box.y2 - lineOffset < this.startY && this.startY < box.y2 + lineOffset) {
                            return { box: i, pos: 'b' };    //b : bottom
                        } else if (box.y1 - lineOffset < this.startY && this.startY < box.y2 + lineOffset) {
                            return { box: i, pos: 'i' };    //i : inside 
                        }
                    } else if (box.x1 - lineOffset < this.startX && this.startX < box.x2 + lineOffset) {
                        if (box.y1 - lineOffset < this.startY && this.startY < box.y2 + lineOffset) {
                            return { box: i, pos: 'i' };
                        }
                    }
                }
            
        }
        return { box: -1, pos: 'o' };   //o : outside
    }

    findCurrentAreaForRotatedRect() {
        for (var i = 0; i < boxes.length; i++) {
            let box = boxes[i];
          
                if (box.angle != null) {
                    // Check relative to center of rectangle
                    //if (x2 > -0.5 * w && x2 < 0.5 * w && y2 > -0.5 * h && y2 < 0.5 * h) {
                    //    return { box: i, pos: 'i' } //Position inside rotated rectangle
                    //}
                    var rotatedPoints = this.getRotatedPoints(box);
                    var result = findCurrentRotatedArea(i, rotatedPoints.rotatedX, rotatedPoints.rotatedY);

                    if (result != null) {
                        return result;
                    }
                }
            
        }
        return { box: -1, pos: 'o' };   //o : outside
    }

    getRotatedPoints(box) {

        var originX = box.x1 + (box.x2 - box.x1) / 2;
        var originY = box.y1 + (box.y2 - box.y1) / 2;
        var w = (box.x2 - box.x1);
        var h = (box.y2 - box.y1);

        var rad = box.angle * Math.PI / 180;

        // translate point values to origin
        var dx = this.startX - originX, dy = this.startY - originY;
        // distance between the point and the center of the rectangle
        var h1 = Math.sqrt(dx * dx + dy * dy);
        var currA = Math.atan2(dy, dx);
        // Angle of point rotated around origin of rectangle in opposition
        var newA = currA - rad;

        // New position of mouse point when rotated
        var x2 = Math.cos(newA) * h1;
        var y2 = Math.sin(newA) * h1;

        return { rotatedX: x2, rotatedY: y2 };
    }

    redraw() {
        if (boxes.length > 0) {
            //toggleDeleteAllBtn(true);
        }
        ctx.clearRect(0, 0, 640, 480);
        //  ctx.beginPath();
        for (var i = 0; i < boxes.length; i++) {

            let box = new Box(boxes[i].id, boxes[i].x1, boxes[i].x2, boxes[i].y1, boxes[i].y2,
                boxes[i].angle, boxes[i].boundingBoxNumber, boxes[i].photoId, boxes[i].action);

                box.drawBoxOn();
            
           // drawBoxOn(boxes[i], ctx);
            // ctx.closePath();
        }

        if (clickedArea.box != -1) {
            var i = clickedArea.box;
            let selectedBox = new Box(boxes[i].id, boxes[i].x1, boxes[i].x2, boxes[i].y1, boxes[i].y2,
                boxes[i].angle, boxes[i].boundingBoxNumber, boxes[i].photoId, boxes[i].action);

            if (selectedBox.angle != null) {
                selectedBox.rotateBox();
            }
            else {
                selectedBox.drawEdgeOnSelectedBox();
            }
        }
        if (clickedArea.box == -1) {
           tmpBox = newBox(this.startX, this.startY, this.endX, this.endY);
            if (tmpBox != null) {
                tmpBox.drawBoxOn();
                ctx.closePath();
            }
        }
    }
}

function initializeCanvasObject() {
    iCanvas = new Canvas();
    boxes = [];
    // get references to the canvas and context
    canvas = document.getElementById("imgCanvas");
    ctx = canvas.getContext("2d");

    // style the context
    // ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2;

    $canvas = $("#imgCanvas");
    setCanvasOffset();
}

function handleMouseDown(e) {
    mousedown = true;

    setCanvasOffset();
    // save the starting x/y of the rectangle
    //If user scroll page horizontally or vertically then minus page offset from canvas offset
    startX = parseFloat(e.clientX - offsetXResult);
    startY = parseFloat(e.clientY - offsetYResult);

    iCanvas = new Canvas(startX, startY, startX, startY);
    clickedArea = iCanvas.findCurrentArea();

    if (clickedArea.box == -1) {
        selectedBoxIndex = -1;
        clickedArea = iCanvas.findCurrentAreaForRotatedRect();
    }

    if (clickedArea.box != -1) {

        $("#btnDelete").removeClass("disabled");
      

        selectedBoxIndex = clickedArea.box;
        iCanvas.redraw();

        let selectedBox = iCanvas.getSelectedBox();
        if (selectedBox.angle != null) {
            selectedBox.rotateBox();
        }
        else {
            selectedBox.drawEdgeOnSelectedBox();
        }
    }
    else {
        $("#btnDelete").addClass("disabled");
        iCanvas.redraw();
    }
}

function handleMouseUp(e) {
    if (clickedArea.box == -1 && tmpBox != null) {
        
        if (tmpBox.doesBoxAreaExists()) {
            boxes.push(tmpBox);
            updateHiddenFieldFromBoxes();

           
           // iCanvas.redraw();
        }
        else {
            var initialBoxes = $("#ClientSideBoundingBoxData").val();
            boxes = JSON.parse(initialBoxes) == null ? [] : JSON.parse(initialBoxes);
            iCanvas.redraw();
        }

    }
    else if (clickedArea.box != -1) {

      
        var selectedBox = iCanvas.getSelectedBox();
        if (selectedBox.x1 > selectedBox.x2) {
            var previousX1 = selectedBox.x1;
            selectedBox.x1 = selectedBox.x2;
            selectedBox.x2 = previousX1;
        }
        if (selectedBox.y1 > selectedBox.y2) {
            var previousY1 = selectedBox.y1;
            selectedBox.y1 = selectedBox.y2;
            selectedBox.y2 = previousY1;
        }

        //Check if box overlap with other existing boxes when moved, resized or rotated
        var isOverlap = false;
        //if (selectedBox.angle != 0) {
        //    isOverlap = willRectangleOverlap(selectedBox);
        //}
        //else {
        //    isOverlap = willOverlap(selectedBox);
        //}

        checkBoxExistAndOverlap(selectedBox);

    }
    clickedArea = { box: -1, pos: 'o' };
    tmpBox = null;
    mousedown = false;
}

function handleMouseOut(e) {
    if (clickedArea.box != -1) {
        var selectedBox = iCanvas.getSelectedBox();
        if (selectedBox.x1 > selectedBox.x2) {
            var previousX1 = selectedBox.x1;
            selectedBox.x1 = selectedBox.x2;
            selectedBox.x2 > previousX1;
        }
        if (selectedBox.y1 > selectedBox.y2) {
            var previousY1 = selectedBox.y1;
            selectedBox.y1 = selectedBox.y2;
            selectedBox.y2 > previousY1;
        }

        //Check if box overlap with other existing boxes when moved, resized or rotated
        var isOverlap = false;
        //if (selectedBox.angle != 0) {
        //    isOverlap = willRectangleOverlap(selectedBox);
        //}
        //else {
        //    isOverlap = willOverlap(selectedBox);
        //}

        checkBoxExistAndOverlap(selectedBox);
    }

    iCanvas = new Canvas(-1, -1, -1, -1);
    mousedown = false;
    clickedArea = { box: -1, pos: 'o' };
    tmpBox = null;
}

function handleMouseMove(e) {
    iCanvas.endX = parseFloat(e.clientX - offsetXResult);
    iCanvas.endY = parseFloat(e.clientY - offsetYResult);
    if (mousedown && clickedArea.box == -1) {
        iCanvas.redraw();
    }
    else if (mousedown && clickedArea.box != -1) {

        UpdateBoxEditAction();

        let box = iCanvas.getSelectedBox();
        xOffset = iCanvas.endX - iCanvas.startX;
        yOffset = iCanvas.endY - iCanvas.startY;
        iCanvas.startX = iCanvas.endX;
        iCanvas.startY = iCanvas.endY;

        if ((box.angle >= 315 && box.angle <= 360) || box.angle < 45) {
            if (clickedArea.pos == 'i' ||
                clickedArea.pos == 'tl' ||
                clickedArea.pos == 'l' ||
                clickedArea.pos == 'bl') {
                boxes[clickedArea.box].x1 += xOffset;
            }
            if (clickedArea.pos == 'i' ||
                clickedArea.pos == 'tl' ||
                // clickedArea.pos == 't' ||
                clickedArea.pos == 'tr') {
                boxes[clickedArea.box].y1 += yOffset;
            }
            if (clickedArea.pos == 'i' ||
                clickedArea.pos == 'tr' ||
                clickedArea.pos == 'r' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].x2 += xOffset;
            }
            if (clickedArea.pos == 'i' ||
                clickedArea.pos == 'bl' ||
                clickedArea.pos == 'b' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].y2 += yOffset;
            }
        }
        else if (box.angle >= 45 && box.angle < 135) {
            if (clickedArea.pos == 'i') {
                boxes[clickedArea.box].x1 += xOffset;
                boxes[clickedArea.box].y1 += yOffset;
                boxes[clickedArea.box].x2 += xOffset;
                boxes[clickedArea.box].y2 += yOffset;
            }
            if (clickedArea.pos == 'tl' ||
                clickedArea.pos == 'l' ||
                clickedArea.pos == 'bl') {
                boxes[clickedArea.box].x1 += yOffset;
            }
            if (clickedArea.pos == 'tl' ||
                // clickedArea.pos == 't' ||
                clickedArea.pos == 'tr') {
                boxes[clickedArea.box].y1 += -xOffset;
            }
            if (clickedArea.pos == 'tr' ||
                clickedArea.pos == 'r' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].x2 += yOffset;
            }
            if (clickedArea.pos == 'bl' ||
                clickedArea.pos == 'b' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].y2 += -xOffset;
            }
        }
        else if (box.angle >= 135 && box.angle < 225) {
            if (clickedArea.pos == 'i' || clickedArea.pos == 'tl' ||
                clickedArea.pos == 'l' ||
                clickedArea.pos == 'bl') {
                boxes[clickedArea.box].x2 += xOffset;
            }
            if (clickedArea.pos == 'i' || clickedArea.pos == 'tl' ||
                // clickedarea.pos == 't' ||
                clickedArea.pos == 'tr') {
                boxes[clickedArea.box].y2 += yOffset;
            }
            if (clickedArea.pos == 'i' || clickedArea.pos == 'tr' ||
                clickedArea.pos == 'r' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].x1 += xOffset;
            }
            if (clickedArea.pos == 'i' || clickedArea.pos == 'bl' ||
                clickedArea.pos == 'b' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].y1 += yOffset;
            }
        }
        else if (box.angle >= 225 && box.angle < 315) {
            if (clickedArea.pos == 'i') {
                boxes[clickedArea.box].x1 += xOffset;
                boxes[clickedArea.box].y1 += yOffset;
                boxes[clickedArea.box].x2 += xOffset;
                boxes[clickedArea.box].y2 += yOffset;
            }
            if (clickedArea.pos == 'tl' ||
                clickedArea.pos == 'l' ||
                clickedArea.pos == 'bl') {
                boxes[clickedArea.box].x1 += -yOffset;
            }
            if (clickedArea.pos == 'tl' ||
                // clickedArea.pos == 't' ||
                clickedArea.pos == 'tr') {
                boxes[clickedArea.box].y1 += xOffset;
            }
            if (clickedArea.pos == 'tr' ||
                clickedArea.pos == 'r' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].x2 += -yOffset;
            }
            if (clickedArea.pos == 'bl' ||
                clickedArea.pos == 'b' ||
                clickedArea.pos == 'br') {
                boxes[clickedArea.box].y2 += xOffset;
            }
        }

        if (clickedArea.pos == 'c') {
            box.initializeRotation();

            updateAngleInBox(box);
        }

        iCanvas.redraw();
    }
}

function UpdateBoxEditAction() {

    if (clickedArea.box != -1) {
        var box = boxes[clickedArea.box];

        if (box.id != null) {
            box.action = EditAct; //Edit = "E"
            boxes[clickedArea.box] = box;
        }
    }
}

function updateAngleInBox(box) {
    var getItemIndex = function (item) {
        return item.boundingBoxNumber == box.boundingBoxNumber;
    }

    var boxIndex = boxes.findIndex(getItemIndex);
    boxes[boxIndex].angle = box.angle;
}

function angle(cx, cy, ex, ey) {
    var dy = ey - cy;  //Calculate difference between center of box and cursor coordinates 
    var dx = ex - cx;
    var theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    if (theta < 0) theta = 360 + theta; // range [0, 360)
    console.log("Angle = " + theta);
    return theta;
}

function setCanvasOffset() {

    // check where the canvas is located on the window
    // (used to help calculate mouseX/mouseY)
    var canvasOffset = $canvas.offset();
    offsetX = canvasOffset.left;
    offsetY = canvasOffset.top;
    //var scrollX = $canvas.scrollLeft();
    //var scrollY = $canvas.scrollTop();
    offsetXResult = offsetX - window.pageXOffset;
    offsetYResult = offsetY - window.pageYOffset;
}

function isPointInsideCircle(r, x1, y1, x0, y0) {
    var dis = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
    return dis < r ? true : false;
}

function getFontSizeForText(x1, y1, x2, y2) {
    let fontSize = 0;
    width = x2 - x1;
    height = y2 - y1;

    let area = width * height;
    let pX = 0;
    let pY = 0;

    if (area <= 9999) {
        fontSize = 10;
        pX = x1 + 5;
        pY = y1 + 10;
    }
    else if (area <= 99999) {
        fontSize = 20;
        pX = x1 + 10;
        pY = y1 + 25;
    }
    else if (area > 99999) {
        fontSize = 25;
        pX = x1 + 10;
        pY = y1 + 25;
    }

    return [fontSize, pX, pY];
}

function newBox(x1, y1, x2, y2) {
    boxX1 = x1 < x2 ? x1 : x2;
    boxY1 = y1 < y2 ? y1 : y2;
    boxX2 = x1 > x2 ? x1 : x2;
    boxY2 = y1 > y2 ? y1 : y2;

    var len = boxes.length;
    // var defaultColor = colorPicker.GetValue();
    var photoId = $("#PhotoId").val();

    var prevBoxNo = len == 0 ? 0 : boxes[len - 1].boundingBoxNumber;
   
    if (boxX2 - boxX1 > lineOffset * 2 && boxY2 - boxY1 > lineOffset * 2) {
        var newBox = new Box(null, boxX1, boxX2, boxY1, boxY2, null, (prevBoxNo + 1), photoId, AddAct); //Add = "A"

        if (!willRectangleOverlap(newBox)) {
            return newBox;
        }
        //if (!willRectangleOverlap(newRect)) {
        //    return newRect;
        //}
    }
    return null;
}

function findCurrentRotatedArea(i, x, y) {
    //This function has defined some rules to check the position of mouse pointer against edges, sides and area of rectangle
    //If user clicks on defined points on edges or sides then logic will allow it to resize
    //If user clicks inside box area then logic will allow to move boxes around 
    //If user clicks outside then no need to perform any changes

    var box = boxes[i];
    var width = box.x2 - box.x1;
    var height = box.y2 - box.y1;
    var x0 = -(box.x2 - box.x1) / 2;
    var y0 = -(box.y2 - box.y1) / 2;
    var x2 = x0 + width;
    var y2 = y0 + height;

    var xCenter = x0 + width / 2;
    var yCenter = y0 + height / 2;

    if (x0 - lineOffset < x && x < x0 + lineOffset) {
        if (y0 - lineOffset < y && y < y0 + lineOffset) {
            return { box: i, pos: 'tl' };    //tl : top left
        } else if (y2 - lineOffset < y && y < y2 + lineOffset) {
            return { box: i, pos: 'bl' };       //bl : bottom left
        } else if (yCenter - lineOffset < y && y < yCenter + lineOffset) {
            return { box: i, pos: 'l' };    //l : left
        }
    } else if (x2 - lineOffset < x && x < x2 + lineOffset) {
        if (y0 - lineOffset < y && y < y0 + lineOffset) {
            return { box: i, pos: 'tr' };   //tr : top right
        } else if (y2 - lineOffset < y && y < y2 + lineOffset) {
            return { box: i, pos: 'br' };   //br : bottom right
        } else if (yCenter - lineOffset < y && y < yCenter + lineOffset) {
            return { box: i, pos: 'r' };    //r : right
        }
    }
    else if (isPointInsideCircle(2 * lineOffset, x, y, xCenter, y0 - 20)) {
        return { box: i, pos: 'c' } //Position inside circle
    }
    else if (xCenter - lineOffset < x && x < xCenter + lineOffset) {
        //if (box.y1 - lineOffset < y && y < box.y1 + lineOffset) {
        //    return { box: i, pos: 't' };    //t : top
        //}
        if (y2 - lineOffset < y && y < y2 + lineOffset) {
            return { box: i, pos: 'b' };    //b : bottom
        } else if (y0 - lineOffset < y && y < y2 + lineOffset) {
            return { box: i, pos: 'i' };    //i : inside 
        }
    } else if (x > -0.5 * width && x < 0.5 * width && y > -0.5 * height && y < 0.5 * height) {
        return { box: i, pos: 'i' } //Position inside rotated rectangle
    }

    return null   //o : outside
}

function drawEdgeOnRotatedBox(x0, y0, width, height) {
    var box = boxes[clickedArea.box];

    var xCenter = x0 + ((x0 + width) - x0) / 2;
    var yCenter = y0 + ((y0 + height) - y0) / 2;

    ctx.fillStyle = "#ffff66";
    ctx.beginPath();

    ctx.fillRect(x0 - anchrSize, y0 - anchrSize, 2 * anchrSize, 2 * anchrSize);

    ctx.fillRect(x0 - anchrSize, yCenter - anchrSize, 2 * anchrSize, 2 * anchrSize);
    ctx.fillRect(x0 - anchrSize, (y0 + height) - anchrSize, 2 * anchrSize, 2 * anchrSize);
    //ctx.fillRect(xCenter - anchrSize, rectBox.y1 - anchrSize, 2 * anchrSize, 2 * anchrSize); // Top center

    ctx.fillRect(xCenter - anchrSize, (y0 + height) - anchrSize, 2 * anchrSize, 2 * anchrSize);
    ctx.fillRect((x0 + width) - anchrSize, y0 - anchrSize, 2 * anchrSize, 2 * anchrSize);
    ctx.fillRect((x0 + width) - anchrSize, yCenter - anchrSize, 2 * anchrSize, 2 * anchrSize);
    ctx.fillRect((x0 + width) - anchrSize, (y0 + height) - anchrSize, 2 * anchrSize, 2 * anchrSize);
    ctx.closePath();

    //Draw a circle on top center point
    ctx.fillStyle = "#ffff66"; //red
    ctx.beginPath();
    ctx.arc(xCenter, y0 - 20, 2 * anchrSize, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

}

function willRectangleOverlap(rect) {
    var rectA = [];

    var rectN = function (p) {
        this.x = p.x;
        this.y = p.y;
    }

    if (rect.angle != null && rect.angle != 0) {
        var p1 = getPointsAfterRotation(rect.x1, rect.y1, rect);
        var p2 = getPointsAfterRotation(rect.x2, rect.y1, rect);
        var p3 = getPointsAfterRotation(rect.x2, rect.y2, rect);
        var p4 = getPointsAfterRotation(rect.x1, rect.y2, rect);

        rectA = [
            new rectN(p1),
            new rectN(p2),
            new rectN(p3),
            new rectN(p4)
        ]
    }
    else {
        var p1 = { x: rect.x1, y: rect.y1 };
        var p2 = { x: rect.x2, y: rect.y1 };
        var p3 = { x: rect.x2, y: rect.y2 };
        var p4 = { x: rect.x1, y: rect.y2 };

        rectA = [
            new rectN(p1),
            new rectN(p2),
            new rectN(p3),
            new rectN(p4)
        ]
    }

    for (var i = 0; i < boxes.length; i++) {
            var rectB = [];

            if (boxes[i].angle != null && boxes[i].angle != 0) {
                var pb1 = getPointsAfterRotation(boxes[i].x1, boxes[i].y1, boxes[i]);
                var pb2 = getPointsAfterRotation(boxes[i].x2, boxes[i].y1, boxes[i]);
                var pb3 = getPointsAfterRotation(boxes[i].x2, boxes[i].y2, boxes[i]);
                var pb4 = getPointsAfterRotation(boxes[i].x1, boxes[i].y2, boxes[i]);

                rectB = [
                    new rectN(pb1),
                    new rectN(pb2),
                    new rectN(pb3),
                    new rectN(pb4)
                ]
            }
            else {
                var pb1 = { x: boxes[i].x1, y: boxes[i].y1 };
                var pb2 = { x: boxes[i].x2, y: boxes[i].y1 };
                var pb3 = { x: boxes[i].x2, y: boxes[i].y2 };
                var pb4 = { x: boxes[i].x1, y: boxes[i].y2 };

                rectB = [
                    new rectN(pb1),
                    new rectN(pb2),
                    new rectN(pb3),
                    new rectN(pb4)
                ]
            }
            var overlapping = doPolygonsIntersect(rectA, rectB);

            if (boxes[i].boundingBoxNumber != rect.boundingBoxNumber) {
                if (overlapping) {
                    return true;
                }
            }
        
    }
    return false;
}

function getPointsAfterRotation(x, y, r) {
    // cx, cy - center of square coordinates
    var cx = r.x1 + (r.x2 - r.x1) / 2;
    var cy = r.y1 + (r.y2 - r.y1) / 2;
    // x, y - coordinates of a corner point of the square
    // theta is the angle of rotation
    var theta = r.angle * Math.PI / 180;

    // translate point to origin
    var tempX = x - cx;
    var tempY = y - cy;

    // now apply rotation
    var rotatedX = tempX * Math.cos(theta) - tempY * Math.sin(theta);
    var rotatedY = tempX * Math.sin(theta) + tempY * Math.cos(theta);

    // translate back
    x = rotatedX + cx;
    y = rotatedY + cy;

    return { x: x, y: y };
}

function checkBoxExistAndOverlap(selectedBox) {
    var doesBoxExist = selectedBox.doesBoxAreaExists();

    if (!doesBoxExist) {
        var initialBoxes = $("#ClientSideBoundingBoxData").val();
        boxes = JSON.parse(initialBoxes) == null ? [] : JSON.parse(initialBoxes);

        iCanvas.redraw();
    }
    else {
        isOverlap = willRectangleOverlap(selectedBox);

        if (isOverlap) {
            var initialBoxes = $("#ClientSideBoundingBoxData").val() != "" ? $("#ClientSideBoundingBoxData").val() : $("#BoundingBoxData").val();
            boxes = JSON.parse(initialBoxes) == null ? [] : JSON.parse(initialBoxes);

            iCanvas.redraw();
        }
        else {
           // setActionFlagOnBox(clickedArea.box, actUpdate);
            updateHiddenFieldFromBoxes();             
            // saveChangesToServer("E");
        }
    }
}

function updateHiddenFieldFromBoxes() {

    var jsonStr = boxes.length > 0 ? JSON.stringify(boxes) : "";
    $("#ClientSideBoundingBoxData").val(jsonStr);

    //Enable and disable save button by comparing server and client side changes 
    //if both are equal then no need to enable button but if there are changes then enable it.
    if (!isServerAndClientSideChangesEqual()) {
        $("#btnSave").removeClass("disabled");
    }
    else {
        $("#btnSave").addClass("disabled");
    }

    ////If the textArea field contains value then enable delete all button 
    ////if it does not contain any value then disable it 
    //if (commentArea.GetValue() != null && commentArea.GetValue() != "") {
    //    toggleDeleteAllBtn(true);
    //}
    //else {
    //    btnEditAnnotation.SetEnabled(false);
    //    btnDeleteAnnotation.SetEnabled(false);
    //    toggleDeleteAllBtn(false);
    //}
}

//#region Separating Axis theorem

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect(a, b) {
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if ((minA) == undefined || projected < minA) {
                    minA = projected;
                }
                if ((maxA) == undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if ((minB) == undefined || projected < minB) {
                    minB = projected;
                }
                if ((maxB) == undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                console.log("polygons don't intersect!");
                return false;
            }

            //if ((minA < maxB && minA > minB) ||
            //    (minB < maxA && minB > minA)) {
            //    continue;
            //}
            //else {
            //    return false;
            //}
        }
    }
    return true;
};

//#endregion
