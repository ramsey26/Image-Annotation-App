using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using WebApp.DTOs;
using WebApp.Models;

namespace WebApp.Services
{
    public class AccountService
    {
        static HttpClient client;
        public AccountService()
        {
            client = HttpClientService.Client;
        }

        public async Task<UserDto> Login(LoginViewModel loginViewModel)
        {
            UserDto userDto;
            HttpResponseMessage resp = await client.PostAsJsonAsync("api/account/login", loginViewModel);
           
            if (resp.IsSuccessStatusCode)
            {
                userDto = await resp.Content.ReadAsAsync<UserDto>();
            }
            else if (resp.StatusCode == HttpStatusCode.Unauthorized)
            {
                var error = await resp.Content.ReadAsAsync<string>();
                throw new UnauthorizedAccessException(error);
            }
            else
            {
                var error = await resp.Content.ReadAsAsync<HttpExceptionDto>();

                Exception eDetails = new Exception(error.Details);
                throw new Exception(error.Message, eDetails);
            }
            return userDto;
        }

        public async Task<UserDto> Register(RegisterDataModel registerDataModel)
        {
            UserDto userDto = null;
            HttpResponseMessage resp = await client.PostAsJsonAsync("api/Account/register", registerDataModel);

            if (resp.IsSuccessStatusCode)
            {
                userDto = await resp.Content.ReadAsAsync<UserDto>();
            }
            else if (resp.StatusCode == HttpStatusCode.BadRequest)
            {
                var error = await resp.Content.ReadAsAsync<string>();
                throw new HttpException(error);
            }
            return userDto;
        }
    }
}