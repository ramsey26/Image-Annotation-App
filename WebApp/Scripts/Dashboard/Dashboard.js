
function openImageInCanvas(id) {
    var imageFileUrl = $("#ImageFileUrl").val();

    $.ajax({
        url: imageFileUrl,
        data: '{fileId:' + JSON.stringify(id) + '}',
        contentType: 'application/json; charset=utf-8',
        type: 'POST',
        success: function (data) {
            $("#divCanvasViewPartial").html(data);
        }
    }).fail(function (callResult) {
        ShowAjaxFailMessage(callResult, 'An error occurred : ');
    });
}

function uploadFile() {
    var form = $("DashboardForm");
    var uploadFileUrl = $("#UploadFileUrl").val();

    var $file = document.getElementById('formFile'),
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