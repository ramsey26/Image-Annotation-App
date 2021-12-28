using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Web;
using WebApp.Helpers;

namespace WebApp.Models
{
    public class FileUploadModel
    {
        [Required]
        [DataType(DataType.Upload)]
        [Display(Name ="Choose Directory")]
        [AllowExtensions(Extensions ="png,jpg,jpeg",ErrorMessage = "Please select only supported files .png/.jpg/.jpeg")]
        public HttpPostedFileBase FileAttach { get; set; }
    }
}