using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WebApp.Interfaces
{
    public interface IUserSession
    {
        string Username { get; }
        string BearerToken { get; }
    }
}
