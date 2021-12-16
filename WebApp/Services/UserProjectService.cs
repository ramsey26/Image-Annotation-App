using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;
using WebApp.DTOs;
using WebApp.Helpers;
using WebApp.Models;

namespace WebApp.Services
{
    public class UserProjectService
    {
        static HttpClient client;
        public UserSession _userSession = null;

        public UserProjectService()
        {
            _userSession = new UserSession();
            client = HttpClientService.Client;
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _userSession.BearerToken);
        }

        public async Task<UserProjectsWithPhotosDto> GetUserProjectByNameAsync(string projectName)
        {
            UserProjectsWithPhotosDto userProjectWithPhotos = null;
            try
            {
                HttpResponseMessage resp = await client.GetAsync($"/api/UserProjects/{projectName}");
                resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    userProjectWithPhotos = await resp.Content.ReadAsAsync<UserProjectsWithPhotosDto>();
                }
            }
            catch(Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return userProjectWithPhotos;
        }

        public async Task<bool> CreateUserProject(UserProjectViewModel userProjectViewModel)
        {
            bool projectCreated = false;
            HttpResponseMessage resp = await client.PostAsJsonAsync("api/UserProjects/add-project", userProjectViewModel);
            //resp.EnsureSuccessStatusCode();

            if (resp.IsSuccessStatusCode)
            {
                projectCreated = true;
            }
            else if (resp.StatusCode == HttpStatusCode.BadRequest)
            {
                var error = await resp.Content.ReadAsAsync<string>();
                throw new HttpException(error);
            }

            return projectCreated;
        }
    }
}