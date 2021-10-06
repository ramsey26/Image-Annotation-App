using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using WebApp.Helpers;
using WebApp.Models;

namespace WebApp.Services
{
    public class UserService
    {
        static HttpClient client;
        public UserSession _userSession = null;

        public UserService()
        {
            _userSession = new UserSession();
            client = HttpClientService.Client;
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _userSession.BearerToken);
        }

        public async Task<MemberDataModel> GetUserData()
        {
            MemberDataModel memberDataModel = null;
            try
            {
                HttpResponseMessage resp = await client.GetAsync($"api/users/{_userSession.Username}");

                resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    memberDataModel = await resp.Content.ReadAsAsync<MemberDataModel>();

                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return memberDataModel;
        }
    }
}