using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace WebApp.DTOs
{
    public class HttpExceptionDto
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public string Details { get; set; }
    }
}