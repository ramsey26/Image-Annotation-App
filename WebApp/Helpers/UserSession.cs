using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Web;
using WebApp.Interfaces;

namespace WebApp.Helpers
{
    public class UserSession : IUserSession
    {
        //public UserSession()
        //{
        //    var currentUser = (ClaimsPrincipal)HttpContext.Current.User;
        //    if(currentUser!=null)
        //    {
        //        Username = currentUser.FindFirst(ClaimTypes.Name)?.Value;
        //        BearerToken = currentUser.FindFirst("AcessToken")?.Value;
        //    }
        //}

        public string Username
        {
            get { return ((ClaimsPrincipal)HttpContext.Current.User).FindFirst(ClaimTypes.Name)?.Value; }
        }

        public string BearerToken
        {
            get { return ((ClaimsPrincipal)HttpContext.Current.User).FindFirst("AcessToken")?.Value; }
        }

    }
}