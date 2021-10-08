using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using WebApp.Helpers;
using WebApp.Models;

namespace WebApp.Services
{
    public class DashboardService
    {
        static HttpClient client;
        public UserSession _userSession = null;

        public DashboardService()
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

        public async Task<bool> UploadPhotoData(PhotoDataModel photoDataModel)
        {
            bool photoUploaded = false;
            try
            {
                HttpResponseMessage resp = await client.PostAsJsonAsync("api/users/uploadPhotoData", photoDataModel);
                resp.EnsureSuccessStatusCode();

                if (resp.IsSuccessStatusCode)
                {
                    photoUploaded = true;
                }
      
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return photoUploaded;
        }
    }
}