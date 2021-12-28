$formData = new FormData();

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

function openImageInCanvas(id,elementId) {
   // $('.spinner').css('display', 'block');

    var imageFileUrl = $("#ImageFileUrl").val();

    $.ajax({
        url: imageFileUrl,
        data: '{photoId:' + JSON.stringify(id) + '}',
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        success: function (data) {
          //  $('.spinner').css('display', 'none');

            $("#divCanvasViewPartial").html(data);
            InitializeRectangleAnnotation();
            handleMouseEvents();

            if (elementId != undefined) {
                $("#hdnPreviousPhotoId").val(elementId - 1);
                $("#hdnNextPhotoId").val(elementId + 1);
            }
        
        }
    }).fail(function (callResult) {
        ShowAjaxFailMessage(callResult, 'An error occurred : ');
    });

    return false;
}

function createLinkNode(keyValPair, elementId) {
    //Create LI node and insert into UL child 
    var node = document.createElement("LI");

    var a = document.createElement('a');

    var textnode = document.createTextNode(keyValPair.fileName);
    a.appendChild(textnode);
    //a.onClick = insertFile(keyValPair.fileKey);
    a.setAttribute("onclick", "insertFile(" + "'" + keyValPair.fileKey + "'," + elementId + ")");
    a.setAttribute("style", "cursor:pointer");
    a.setAttribute("class", "list-group-item");
    a.setAttribute("id", elementId);

    node.appendChild(a);
    document.getElementById("listFiles").appendChild(node);
}

function uploadFile() {

    $('.spinner').css('display', 'block');

    var countOfPhotosSaved = $("#hdnPhotoCount").val() == "" ? 0 : parseInt($("#hdnPhotoCount").val());

    var form = $("DashboardForm");
    var uploadFileNameUrl = $("#UploadFileNameUrl").val();

    var $file = document.getElementById('formFile');
    var val = $("#formFile").val();
    if (val == "") {
        showToastrJs(error,"Please choose a Photo.");
        return false;
    }
    else {
        var countImageFiles = 0;

        var keyValPair = {
            fileKey: '',
            fileName: ''
        };

        if ($file.files.length > 0) {
            for (var i = 0; i < $file.files.length; i++) {

                //Allow only image files to upload 
                if ($file.files[i].type == "image/jpeg" || $file.files[i].type == "image/x-png" ||
                    $file.files[i].type == "image/jpg") {
                    $formData.append('file-' + i, $file.files[i]);

                    keyValPair = {
                        fileKey: 'file-' + i,
                        fileName: $file.files[i].name
                    };

                    var elementId = countOfPhotosSaved + countImageFiles + 1;
                    //arrFileNames.push(keyValPair);
                    createLinkNode(keyValPair, elementId);
                    countImageFiles++;
                }
            }
        }

        $('.spinner').css('display', 'none');

        var canvasExists = document.getElementById("imgCanvas");

        if (canvasExists == null) {
            //After creating link nodes, upload first photo from the uploaded files
            insertFile('file-0');  //key for first file is "file-0"
        }

        var totalCount = countOfPhotosSaved + countImageFiles;

        document.getElementById("headerPhotoCount").innerText = totalCount;

        $("#hdnPreviousPhotoId").val(0);
        $("#hdnNextPhotoId").val(countImageFiles > 1 ? 2 : 0);

        //$.ajax({
        //    url: uploadFileNameUrl,
        //    type: 'POST',
        //    data: '{filesViewModels:' + JSON.stringify(arrFileNames) + '}',
        //    contentType: 'application/json; charset=utf-8',
        //    success: function (data) {

        //        $("#divFilesViewPartial").html(data);
        //        //var message = "Photo uploaded successfully";
        //        //showToastrJs(success, message);

        //        //$("#divGridViewPartial").html(data);
        //        $('.spinner').css('display', 'none');
        //    },
        //    error: function (callResult) {
        //        ShowAjaxFailMessage(callResult, 'An error occurred : ');
        //    }
        //});
    }
    return false;
}

function insertFile(fileKey,elementId) {

    $('.spinner').css('display', 'block');
    var formData = new FormData();
    var fileData = $formData.get(fileKey);
    formData.append(fileKey, fileData);

    var insertFileUrl = $("#InsertFileUrl").val();

    $.ajax({
        url: insertFileUrl,
        type: 'POST',
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            $('.spinner').css('display', 'none');
            if (data.fileId > -1) {
                var message = "Photo uploaded successfully.";

                if (data.IsFileUploaded) {
                    showToastrJs(success, message);
                }

                openImageInCanvas(data.fileId, elementId);
            }
            else {
                var message = "Please upload image file.";
                showToastrJs(error, message);
            }
        },
        error: function (callResult) {
            ShowAjaxFailMessage(callResult, 'An error occurred : ');
        }
    });
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

function movePrevious() {
    var prevValue = $("#hdnPreviousPhotoId").val();

    if (prevValue > 0) {

        var link = document.getElementById(prevValue);
        if (link != null) {
            $("#hdnPreviousPhotoId").val(parseInt(prevValue) - 1);
            $("#hdnNextPhotoId").val(parseInt(prevValue) + 1);

            link.click();
        }
    }
    return false;
}

function moveNext() {
    var nextValue = $("#hdnNextPhotoId").val();

    if (nextValue > 1) {
        var link = document.getElementById(nextValue);

        if (link != null) {
            $("#hdnPreviousPhotoId").val(parseInt(nextValue) - 1);
            $("#hdnNextPhotoId").val(parseInt(nextValue) + 1);

            link.click();
        }
    }
    return false;
}