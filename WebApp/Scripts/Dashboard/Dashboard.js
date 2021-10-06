
function uploadFile() {
    var fileAttach = $("#formFile").val();

    //if (fileAttach == "") {
    //    alert("Please attach a file.");
    //    return false;
    //}
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
            alert("Error on uploading file: " + callResult.responseText);
        }
    });
}