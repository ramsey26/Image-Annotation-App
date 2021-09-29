using Microsoft.Owin.Security;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Security.Claims;
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
            UserDto userDto = null;
            //try
            //{
            HttpResponseMessage resp = await client.PostAsJsonAsync("api/account/login", loginViewModel);
            // resp.EnsureSuccessStatusCode();
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
            //}
            //catch (Exception ex)
            //{
            //    throw new Exception(ex.Message, ex.InnerException);
            //}
            return userDto;
        }

        public async Task<UserDto> Register(RegisterDataModel registerDataModel)
        {
            UserDto userDto = null;
            //try
            //{
                HttpResponseMessage resp = await client.PostAsJsonAsync("api/Account/register", registerDataModel);
               // resp.EnsureSuccessStatusCode();
                if (resp.IsSuccessStatusCode)
                {
                    userDto = await resp.Content.ReadAsAsync<UserDto>();
                }
                else if (resp.StatusCode == HttpStatusCode.BadRequest)
                {
                    var error = await resp.Content.ReadAsAsync<string>();
                    throw new HttpException(error);
                }
            //}
            //catch (Exception ex)
            //{
            //    throw new Exception(ex.Message);
            //}
            return userDto;
        }
    }
}