using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/tidraft")]
    public class TidraftController : ControllerBase
    {
        private readonly HttpClient httpClient;

        public TidraftController(IHttpClientFactory httpClientFactory)
        {
            this.httpClient = httpClientFactory.CreateClient("Tidraft");
        }

        [HttpGet("{slug}")]
        public async Task<ActionResult<string>> Get(string slug)
        {
            if (slug.Length > 100 || !Regex.IsMatch(slug, "^[a-z0-9]+(?:-[a-z0-9]+)*$"))
            {
                return this.BadRequest();
            }

            var response = await this.httpClient.GetAsync($"https://tidraft.com/draft/{slug}.data");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            if (!response.IsSuccessStatusCode)
            {
                return this.StatusCode(502);
            }

            var data = await response.Content.ReadAsStringAsync();
            if (data.Length > 2 * 1024 * 1024)
            {
                return this.StatusCode(502);
            }

            return this.Content(data, "text/plain");
        }
    }
}
