
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
        showToastrJs("error","Please choose a Photo.");
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
                var message = data;
                $('.spinner').css('display', 'none');
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

function InitializeRectangleAnnotation() {

    //if (!$("#btnRect").hasClass("active")) {
    //    $("#btnRect").addClass("active");

    //    $("#btnCircle").addClass("disabled");
    //    $("#btnPolygon").addClass("disabled");
        initializeCanvasObject();
        loadBoundingBoxes();
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
    //}
    //else {
    //    $("#btnRect").removeClass("active");
    //    $("#btnCircle").removeClass("disabled");
    //    $("#btnPolygon").removeClass("disabled");
    //}   
}

function loadBoundingBoxes() {
    const boxData = $("#BoundingBoxData").val();

    if (boxData != null && boxData != "" && boxData != "[]") {
        boxes = JSON.parse(boxData);
        let instCanvas = new Canvas();
        instCanvas.redraw();
    }
}

function saveBoundingBox() {

    if (!isServerAndClientSideChangesEqual()) {

        var photoId = $("#PhotoId").val();
        var contentUrl = $('#SaveBoundingBoxUrl').val();

        var colBoxData = $("#ClientSideBoundingBoxData").val();

        $.ajax({
            url: contentUrl,
            data: '{boundingBoxDtos:' + colBoxData + ',photoId:' + photoId + '}',
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            success: function (data) {
                $("#divCanvasViewPartial").html(data);
               
                showToastrJs("success", "Box Added Successfully.");

                InitializeRectangleAnnotation();
            }
        }).fail(function (callResult) {
            ShowAjaxFailMessage(callResult, 'An error occurred : ');
        });

    }
}

function isEmptyCheck(value) {
    return typeof value == 'string' && !value.trim() || typeof value == 'undefined' || value === null;
}

function isServerAndClientSideChangesEqual() {

    var serverChanges = $("#BoundingBoxData").val();
   
    var arrServer = serverChanges != null && serverChanges != "" && serverChanges != "[]" ? JSON.parse(serverChanges) : null;
    var arrClient = boxes;

    if (!isArraysEqual(arrServer, arrClient)) {
        return false;
    }
    else {
        return true;
    }
}

function isArraysEqual(a, b) {
    if (a === null && b === null) return true;
    if (a !== null && b === null) return false;
    if (a === null && b !== null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; i++) {
        if (a[i].boundingBoxNumber != b[i].boundingBoxNumber || a[i].angle != b[i].angle || a[i].x1 != b[i].x1 || a[i].y1 != b[i].y1 || a[i].x2 != b[i].x2 || a[i].y2 != b[i].y2) {
            return false;
        }
    }
    return true;
}