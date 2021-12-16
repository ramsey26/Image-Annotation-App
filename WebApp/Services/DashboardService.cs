using System;
using System.Collections.Generic;
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

        public async Task<List<BoundingBoxDataModel>> GetBoxByPhotoId(int photoId)
        {
            List<BoundingBoxDataModel> boundingBoxes = null; 
            try
            {
                HttpResponseMessage resp = await client.GetAsync($"api/BoundingBox/{photoId}");
                resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    boundingBoxes = await resp.Content.ReadAsAsync<List<BoundingBoxDataModel>>();
                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return boundingBoxes;
        }

        public async Task<bool> SaveBoundingBoxData(IEnumerable<BoundingBoxDataModel> boundingBoxDataModel)
        {
            try
            {
                HttpResponseMessage resp = await client.PostAsJsonAsync("api/BoundingBox/save-box", boundingBoxDataModel);
                resp.EnsureSuccessStatusCode();

                if (!resp.IsSuccessStatusCode)
                {
                    return false;
                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return true;
        }

        public async Task<List<PolygonDataModel>> GetPolygonsByPhotoId(int photoId)
        {
            List<PolygonDataModel> polygonData = null;
            try
            {
                HttpResponseMessage resp = await client.GetAsync($"api/Polygon/{photoId}");
                resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    polygonData = await resp.Content.ReadAsAsync<List<PolygonDataModel>>();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return polygonData;
        }

        public async Task<bool> SavePolygonData(IEnumerable<PolygonDataModel> polygonDataModels)
        {
            try
            {
                HttpResponseMessage resp = await client.PostAsJsonAsync("api/Polygon/save-polygon", polygonDataModels);
                resp.EnsureSuccessStatusCode();
                if (!resp.IsSuccessStatusCode)
                {
                    return false;
                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return true;
        }

        public async Task<bool> UploadPhotoData(PhotoDataModel photoDataModel,int projectId)
        {
            bool photoUploaded = false;
            try
            {
                HttpResponseMessage resp = await client.PostAsJsonAsync($"api/photo/upload-photo/{projectId}", photoDataModel);
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

        public async Task<PhotoDataModel> GetLastPhotoData(int projectId)
        {
            PhotoDataModel photoData = null;
            try
            {
                HttpResponseMessage resp = await client.GetAsync($"api/photo/getLastPhoto/{projectId}");

                resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    photoData = await resp.Content.ReadAsAsync<PhotoDataModel>();

                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return photoData;
        }
    }
}