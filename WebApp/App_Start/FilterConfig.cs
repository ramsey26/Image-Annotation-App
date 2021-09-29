using System;
using System.Web;
using System.Web.Mvc;

namespace WebApp
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute() { ExceptionType = typeof(Exception), View = "Error" });
            filters.Add(new HandleErrorAttribute() { ExceptionType = typeof(HttpException), View = "Error404" });
        }
    }
}
