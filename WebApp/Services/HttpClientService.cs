using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;

namespace WebApp.Services
{
    public class HttpClientService : IDisposable
    {
        static HttpClient _client;

        public static HttpClient Client
        {
            get { return _client ?? (_client = CreateClient()); }
        }

        static HttpClient CreateClient()
        {
            string baseUri = ConfigurationManager.AppSettings["ImageAnnotationAPI"];
            _client = new HttpClient
            {
                BaseAddress = new Uri(baseUri)
            };
            _client.DefaultRequestHeaders.Accept.Clear();
            _client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
            return _client;
        }

        public void Dispose()
        {
            _client.Dispose();
        }
    }
}