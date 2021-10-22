using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using WebApp.DTOs;
using WebApp.Models;

namespace WebApp.Utilities
{
    public static class AutoMapperConfiguration
    {

        public static void Configure()
        {
            Mapper.Initialize(x =>
            {
                x.CreateMap<RegisterViewModel, RegisterDataModel>();
                x.CreateMap<BoundingBoxDto, BoundingBoxDataModel>();
            });
          
        }
    }
}