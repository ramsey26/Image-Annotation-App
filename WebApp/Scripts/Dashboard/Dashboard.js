
download_img = function (el) {
    // get image URI from canvas object
    var photoName = $("#PhotoName").val();
    var background = new Image();
    background.src = $("#imageSrc").val();

    var canvas2 = document.getElementById("imgCanvas");
    var context2 = canvas2.getContext("2d");
    context2.globalCompositeOperation = "destination-over";
    context2.drawImage(background, 0, 0, 640, 480);

    var dt = canvas2.toDataURL('image/jpeg');
    var dataURL = dt.replace(/^data:image\/[^;]+/, 'data:application/octet-stream');

    //var newTab = window.open('about:blank', 'image from canvas');
    //newTab.document.write("<img src='" + dataURL + "' alt='from canvas'/>");
    el.setAttribute("download", photoName);
    el.href = dataURL;
};

function download() {
    var linkEle = document.getElementById("lnkDownloadImage");
    //linkEle.href = dataURL;

    linkEle.click();
}

const error = "error";
const success = "success";

function showToastrJs(type,msg) {
    toastr.options =
    {
        "debug": false,
        "positionClass": "toast-bottom-right",
        "onclick": null,
        "fadeIn": 300,
        "fadeOut": 200,
        "timeOut": 3000,
        "extendedTimeOut": 1000
    }

    if (type == "success") {
        toastr["success"](msg);
    }
    else if (type == "error") {
        toastr["error"](msg);
    }
}

function loadGridView(message) {
    var getGridViewDataUrl = $("#GetGridViewDataUrl").val();

    $.ajax({
        url: getGridViewDataUrl,
        type: 'POST',
       // data: $formData,
        dataType: 'json',
        contentType: false,
        processData: false,
        success: function (data) {
         
            $("#divGridViewPartial").html(data);

            showToastrJs(success, message);
        },
        error: function (callResult) {
            ShowAjaxFailMessage(callResult, 'An error occurred : ');
        }
    });
}

function openImageInCanvas(id) {
    var imageFileUrl = $("#ImageFileUrl").val();

    $.ajax({
        url: imageFileUrl,
        data: '{photoId:' + JSON.stringify(id) + '}',
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        success: function (data) {
            $("#divCanvasViewPartial").html(data);
            InitializeRectangleAnnotation();
            handleMouseEvents();
        }
    }).fail(function (callResult) {
        ShowAjaxFailMessage(callResult, 'An error occurred : ');
    });
}

function uploadFile() {

    $('.spinner').css('display', 'block');

    var form = $("DashboardForm");
    var uploadFileUrl = $("#UploadFileUrl").val();

    var $file = document.getElementById('formFile');
    var val = $("#formFile").val();
    if (val == "") {
        showToastrJs(error,"Please choose a Photo.");
        return false;
    }
    else {

        $formData = new FormData();

        if ($file.files.length > 0) {
            for (var i = 0; i < $file.files.length; i++) {
                $formData.append('file-' + i, $file.files[i]);
            }
        }

        $.ajax({
            url: uploadFileUrl,
            type: 'POST',
            data: $formData,
            dataType: 'json',
            contentType: false,
            processData: false,
            success: function (data) {

                var message = "Photo uploaded successfully";
                showToastrJs(success, message);

                $("#divGridViewPartial").html(data);
            
            },
            error: function (callResult) {
                ShowAjaxFailMessage(callResult, 'An error occurred : ');
            }
        });
    }
}

function ShowAjaxFailMessage(callResult, baseMessage) {
    if (callResult.responseText.startsWith("<!DOC")) {
        alert(baseMessage + '\n\n' + callResult.responseText);
        return;
    }

    var infoData = JSON.parse(callResult.responseText);

    var info = baseMessage + '\n\n' + infoData.message + '\n\n';
    info = info + 'Stacktrace:\n' + infoData.stacktrace;

    alert(info);
}

function handleMouseEvents() {
    // listen for mouse events
    $("#imgCanvas").mousedown(function (e) {
        handleMouseDown(e);
    });
    $("#imgCanvas").mousemove(function (e) {
        handleMouseMove(e);
    });
    $("#imgCanvas").mouseup(function (e) {
        handleMouseUp(e);
    });
    $("#imgCanvas").mouseout(function (e) {
        handleMouseOut(e);
    });
}

function InitializeRectangleAnnotation() {

    $("#btnRect").addClass("active");
    if ($("#btnPolygon").hasClass("active")) {
        $("#btnPolygon").removeClass("active")
    }
    polygonFlag = false;
    //if (!$("#btnRect").hasClass("active")) {
    //    $("#btnRect").addClass("active");

    //    $("#btnCircle").addClass("disabled");
    //    $("#btnPolygon").addClass("disabled");
    initializeCanvasObject();
   // initializeCanvasButtons();
    refreshAnnotations();

    //}
    //else {
    //    $("#btnRect").removeClass("active");
    //    $("#btnCircle").removeClass("disabled");
    //    $("#btnPolygon").removeClass("disabled");
    //}   
}

function InitializePolygonAnnotation() {

    $("#btnPolygon").addClass("active");
    if ($("#btnRect").hasClass("active")) {
        $("#btnRect").removeClass("active")
    }

    polygonFlag = true;

    initializeCanvasObject();
    //initializeCanvasButtons();
    refreshAnnotations();
}

function initializeCanvasButtons() {
    $("#btnDelete").addClass("disabled");
    $("#btnSave").addClass("disabled");
    $("#btnRefresh").addClass("disabled");
    $("#btnDownload").removeClass("disabled");

    document.getElementById("btnSave").disabled = true;
    document.getElementById("btnRefresh").disabled = true;
    document.getElementById("btnDelete").disabled = true;
    document.getElementById("btnDownload").disabled = false;
}

function refreshAnnotations() {
    initializeCanvasButtons();
    if (polygonFlag) {
        loadPolygons();
    }
    else {
        loadBoundingBoxes();
    }
}

function loadPolygons() {
    polygons = [];
    lineSegments = [];
    removedPolygons = [];
    var polygonData = $("#PolygonData").val();

    if (polygonData != null && polygonData != "" && polygonData != "[]") {
        var sPolygonsData = JSON.parse(polygonData);

        //Continue.......
        polygons = sPolygonsData.map(function (item) {
            var objPolygon = new Polygon(item.id, item.polygonNo, item.startX, item.startY, item.endX, item.endY, item.photoId, null);

            return objPolygon;
        });

        sPolygonsData.map(function (item) {

            item.lineSegments.map((lineSegment) => {

                var lineObj = new LineSegment(lineSegment.id, lineSegment.polygonNo, lineSegment.x1, lineSegment.y1, lineSegment.x2, lineSegment.y2);
                lineSegments.push(lineObj);
            });

            // var objLineSegment = new LineSegment(item.lineSegments.id, item.lineSegments.polygonNo, item.lineSegments.x1, item.lineSegments.y1, item.lineSegments.x2, item.lineSegments.y2);

            //    return arrLineSegment;
        });

        drawPolygon();
    }
}

function loadBoundingBoxes() {
    boxes = [];
    removedBoxes = [];

    const boxData = $("#BoundingBoxData").val();
    
    if (boxData != null && boxData != "" && boxData != "[]") {
        var sBoxes = JSON.parse(boxData);

        boxes = sBoxes.map(function (item) {
            var objBox = new Box(item.id, item.x1, item.x2, item.y1, item.y2, item.angle, item.boundingBoxNumber, item.photoId, null);
            return objBox;
        });
    }
    let instCanvas = new Canvas();
    instCanvas.redraw();
}

function addAction(item) {
    var objBox = new Box(item.id, item.x1, item.x2, item.y1, item.y2, item.angle, item.boundingBoxNumber, item.photoId, null);
    return objBox;
}

function saveAnnotations() {
    if (polygonFlag) {
        savePolygons();
    }
    else {
        saveBoundingBox();
    }
}

function savePolygons() {
    if (!isServerAndClientSideChangesEqual()) {
        var photoId = $("#PhotoId").val();
        var contentUrl = $('#SavePolygonUrl').val();

        let allPolygons = polygons;

        if (removedPolygons.length != 0) {
            for (var i = 0; i < removedPolygons.length; i++) {
                allPolygons.push(removedPolygons[i]);
            }
        }

        const arrPolygonData = allPolygons.map(function (value, index) {
            var lineSeg = lineSegments.filter((lineSegment) => {
                return lineSegment.polygonNo == value.polygonNo;
            });

            var obj = {
                id: value.id,
                polygonNo: value.polygonNo,
                startX: value.startX,
                startY: value.startY,
                endX: value.endX,
                endY: value.endY,
                photoId: value.photoId,
                action: value.action,
                lineSegments: lineSeg
            }

            return obj;
        });

        var jsonStr = JSON.stringify(arrPolygonData);

        $.ajax({
            url: contentUrl,
            data: '{polygonData:' + jsonStr + ',photoId:' + photoId + '}',
            contentType: 'application/json;charset=utf-8',
            type: 'POST',
            success: function (data) {
                $("#divCanvasViewPartial").html(data);
                var element = document.getElementById("btnSave");
                showToastrJs(success, "Changes saved successfully.");

                $("#btnSave").addClass("disabled");
                $("#btnRefresh").addClass("disabled");

                document.getElementById("btnSave").disabled = true;
                document.getElementById("btnRefresh").disabled = true;

                InitializePolygonAnnotation();

                handleMouseEvents();
            }
        }).fail(function (callResult) {
            ShowAjaxFailMessage(callResult, 'An error occurred : ');
        });
    }
}

function saveBoundingBox() {

    if (!isServerAndClientSideChangesEqual()) {

        var photoId = $("#PhotoId").val();
        var contentUrl = $('#SaveBoundingBoxUrl').val();

        let arrBoxesData = boxes;

       // var boxesData = ; //$("#ClientSideBoundingBoxData").val();
       
       // arrBoxesData.push(boxes);

        if (removedBoxes.length != 0) {
            for (var i = 0; i < removedBoxes.length; i++) {
                arrBoxesData.push(removedBoxes[i]);
            }
        }

        var jsonStr = JSON.stringify(arrBoxesData);

        $.ajax({
            url: contentUrl,
            data: '{boundingBoxDtos:' + jsonStr + ',photoId:' + photoId + '}',
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            success: function (data) {
                $("#divCanvasViewPartial").html(data);
                var element = document.getElementById("btnSave");
                showToastrJs(success, "Changes saved successfully.");

                $("#btnSave").addClass("disabled");
                $("#btnRefresh").addClass("disabled");

                document.getElementById("btnSave").disabled = true;
                document.getElementById("btnRefresh").disabled = true;

                InitializeRectangleAnnotation();
                handleMouseEvents();
            }
        }).fail(function (callResult) {
            ShowAjaxFailMessage(callResult, 'An error occurred : ');
        });

    }
}

function removeAnnotations() {

    if (polygonFlag) {
        removePolygon();
    }
    else {
        removeBoundingBox();     
    }
}

function removePolygon() {

    //#region Remove polygon from polygons array
    //var getIndex = function (item) {
    //    return item.polygonNo == clickedPolygon.polygonNo;
    //}

    // var polyIndx = polygons.findIndex(getIndex);

    if (polygons[clickedPolygon.indx].id != null) {
        polygons[clickedPolygon.indx].action = DeleteAct;
        removedPolygons.push(polygons[clickedPolygon.indx]);
    }
    polygons.splice(clickedPolygon.indx, 1);
    //#endregion 

    //#region Remove linesegments for removed polygon
    const filteredLineSegments = lineSegments.filter((lineSegment) => {
        return lineSegment.polygonNo != clickedPolygon.polygonNo;
    });

    lineSegments = [];
    lineSegments = filteredLineSegments;
    //#endregion 

    updateHiddenFieldPolygon();

    drawPolygon();
    $("#btnDelete").addClass("disabled");
    document.getElementById("btnDelete").disabled = true;
}

function removeBoundingBox() {
    if (selectedBoxIndex != -1) {

        if (boxes[selectedBoxIndex].id != null) {
            boxes[selectedBoxIndex].action = DeleteAct;
            removedBoxes.push(boxes[selectedBoxIndex]);
        }

        boxes.splice(selectedBoxIndex, 1);
        updateHiddenFieldFromBoxes();

        $("#btnDelete").addClass("disabled");
        document.getElementById("btnDelete").disabled = true;
        iCanvas.redraw();
    }
}

function isEmptyCheck(value) {
    return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

function isServerAndClientSideChangesEqual() {
    var serverChanges = null;
    var clientChanges = null;

    if (polygonFlag) {
        serverChanges = $("#PolygonData").val();
        clientChanges = $("#ClientSidePolygonData").val();

        var arrServer = serverChanges != null && serverChanges != "" && serverChanges != "[]" ? JSON.parse(serverChanges) : null;
        var arrClient = clientChanges != null && clientChanges != "" && clientChanges != "[]" ? JSON.parse(clientChanges) : null;

        if (!isPolygonsEqual(arrServer, arrClient)) {
            return false;
        }
        else {
            return true;
        }
    }
    else {
        serverChanges = $("#BoundingBoxData").val();
        clientChanges = $("#ClientSideBoundingBoxData").val();

        var arrServer = serverChanges != null && serverChanges != "" && serverChanges != "[]" ? JSON.parse(serverChanges) : null;
        var arrClient = clientChanges != null && clientChanges != "" && clientChanges != "[]" ? JSON.parse(clientChanges) : null;

        if (!isBoxesEqual(arrServer, arrClient)) {
            return false;
        }
        else {
            return true;
        }
    }
    
}

function isBoxesEqual(a, b) {

    if (a === null && b === null) return true;
    if (a !== null && b === null) return false;
    if (a === null && b !== null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; i++) {
        if (a[i].angle != b[i].angle || a[i].x1 != b[i].x1 || a[i].y1 != b[i].y1 || a[i].x2 != b[i].x2 || a[i].y2 != b[i].y2) {
            return false;
        }
    }
    return true;
}

function isPolygonsEqual(a, b) {
    if (a === null && b === null) return true;
    if (a !== null && b === null) return false;
    if (a === null && b !== null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; i++) {
        if (a[i].startX != b[i].startX || a[i].startY != b[i].startY || a[i].endX != b[i].endX || a[i].endY != b[i].endY) {
            return false;
        }
    }
    return true;
}

function toggleDeleteButton() {
    if ($("#btnDelete").hasClass("disabled")) {
        $("#btnDelete").removeClass("disabled");
        // $("#btnDelete").addClass("active");
    }
    else {
        $("#btnDelete").addClass("disabled");
    }
}

function toggleSaveButton() {
    if ($("#btnSave").hasClass("disabled")) {
        $("#btnSave").removeClass("disabled");
        // $("#btnSave").addClass("active");
    }
    else {
        $("#btnSave").addClass("disabled");
    }
}