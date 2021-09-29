using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using WebApp.Models;

namespace WebApp.Services
{
    public class UserService
    {
        static HttpClient client;
        public UserService()
        {
            client = HttpClientService.Client;
        }

        public async Task<IEnumerable<AppUser>> GetUsers()
        {
            IEnumerable<AppUser> appUsers = null; 
            try
            {
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "Your Oauth token");

            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return appUsers;
        }
    }
}