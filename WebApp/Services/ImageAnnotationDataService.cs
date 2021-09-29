using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace WebApp.Services
{
    /// <summary>
    /// Define Service for planning and monitoring tool data.
    /// </summary>
    public class ImageAnnotationDataService
    {
        static HttpClient client;
        public ImageAnnotationDataService()
        {
            client = HttpClientService.Client;
        }


    }
}