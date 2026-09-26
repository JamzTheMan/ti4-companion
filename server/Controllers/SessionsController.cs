using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Server.Domain;
using Server.Infra;
using Server.Persistence;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class SessionsController : ControllerBase
    {
        private readonly ILogger<SessionsController> logger;
        private readonly SessionContext sessionContext;
        private readonly ITimeProvider timeProvider;
        private readonly IConfiguration configuration;
        private readonly IRepository repository;
        private readonly Authorization authorization;
        private readonly HttpClient tidraftHttpClient;

        public SessionsController(
            ILogger<SessionsController> logger,
            SessionContext sessionContext,
            ITimeProvider timeProvider,
            IConfiguration configuration,
            IRepository repository,
            Authorization authorization,
            IHttpClientFactory httpClientFactory)
        {
            this.logger = logger;
            this.sessionContext = sessionContext;
            this.timeProvider = timeProvider;
            this.configuration = configuration;
            this.repository = repository;
            this.authorization = authorization;
            this.tidraftHttpClient = httpClientFactory.CreateClient("Tidraft");
        }

        [HttpPost]
        public async Task<ActionResult<Session>> Post(GameStartedPayload payload)
        {
            byte[] tidraftMap = null;
            if (!string.IsNullOrWhiteSpace(payload.TidraftMapUrl))
            {
                if (!IsValidTidraftMapUrl(payload.TidraftUrl, payload.TidraftMapUrl))
                {
                    return this.BadRequest("The TIDraft galaxy map URL is invalid.");
                }

                try
                {
                    using var response = await this.tidraftHttpClient.GetAsync(
                        payload.TidraftMapUrl,
                        HttpCompletionOption.ResponseHeadersRead);
                    if (!response.IsSuccessStatusCode ||
                        response.Content.Headers.ContentLength > 3000000 ||
                        !string.Equals(
                            response.Content.Headers.ContentType?.MediaType,
                            "image/png",
                            StringComparison.OrdinalIgnoreCase))
                    {
                        return this.StatusCode(502, "TIDraft's galaxy map could not be downloaded.");
                    }

                    using var mapStream = await response.Content.ReadAsStreamAsync();
                    using var mapBuffer = new MemoryStream();
                    var buffer = new byte[81920];
                    int bytesRead;
                    while ((bytesRead = await mapStream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                    {
                        if (mapBuffer.Length + bytesRead > 3000000)
                        {
                            return this.StatusCode(502, "TIDraft's galaxy map is too large.");
                        }

                        mapBuffer.Write(buffer, 0, bytesRead);
                    }

                    tidraftMap = mapBuffer.ToArray();
                    if (!IsPng(tidraftMap))
                    {
                        return this.StatusCode(502, "TIDraft returned an invalid galaxy map image.");
                    }
                }
                catch (HttpRequestException)
                {
                    return this.StatusCode(502, "TIDraft's galaxy map could not be downloaded.");
                }
                catch (TaskCanceledException)
                {
                    return this.StatusCode(502, "TIDraft's galaxy map download timed out.");
                }
            }

            var sessionId = Guid.NewGuid();
            var newSession = new Session { Id = sessionId, CreatedAt = this.timeProvider.Now };
            newSession.Events = new List<GameEvent>
            {
                new GameEvent
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    HappenedAt = this.timeProvider.Now,
                    EventType = GameEvent.GameStarted,
                    SerializedPayload = JsonConvert.SerializeObject(payload.SetupType == Domain.Katowice.Constants.SetupType ? Domain.Katowice.Draft.GetPayloadWithRandomOrder(payload) : payload),
                },
            };

            if (payload.SetupType == "draft")
            {
                newSession.Events.Add(GameEvent.GenerateOrderEvent(sessionId, payload, payload.Options.BanRounds, this.timeProvider.Now, addForSpeaker: false));
            }

            if (tidraftMap != null)
            {
                var sessionBlobContainer = new BlobContainerClient(this.configuration.GetConnectionString("BlobStorage"), sessionId.ToString());
                await sessionBlobContainer.CreateIfNotExistsAsync(PublicAccessType.Blob);

                var mapBlobClient = sessionBlobContainer.GetBlobClient("map");
                var blobHttpHeader = new BlobHttpHeaders { ContentType = "image/png" };
                using var mapStream = new MemoryStream(tidraftMap);
                await mapBlobClient.UploadAsync(mapStream, blobHttpHeader);

                newSession.Events.Add(new GameEvent
                {
                    Id = Guid.NewGuid(),
                    SessionId = sessionId,
                    HappenedAt = this.timeProvider.Now,
                    EventType = GameEvent.MapAdded,
                    SerializedPayload = mapBlobClient.Uri.ToString(),
                });
            }

            await this.repository.SaveSessionToListAsync(this.HttpContext.Items["ListIdentifier"].ToString(), newSession);
            await this.sessionContext.SaveChangesAsync();

            var dto = new SessionDto(newSession);
            dto.Secret = (await this.authorization.GenerateTokenFor(sessionId)).Value;
            if (!string.IsNullOrWhiteSpace(payload.Password))
            {
                dto.Secured = true;
                FormattableString commandText = $"UPDATE \"Sessions\" SET \"HashedPassword\"=crypt({payload.Password}, gen_salt('bf')) WHERE \"Id\"={sessionId}";
                this.sessionContext.Database.ExecuteSqlInterpolated(commandText);
            }

            return this.CreatedAtAction(nameof(this.GetSession), new { sessionId = newSession.Id }, dto);
        }

        private static bool IsValidTidraftMapUrl(string tidraftUrl, string mapUrl)
        {
            if (!Uri.TryCreate(tidraftUrl, UriKind.Absolute, out var sourceUri) ||
                !string.Equals(sourceUri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) ||
                (sourceUri.Host != "tidraft.com" && sourceUri.Host != "www.tidraft.com") ||
                !sourceUri.IsDefaultPort ||
                !Regex.IsMatch(sourceUri.AbsolutePath, @"^/draft/([a-z0-9]+(?:-[a-z0-9]+)*)/?$"))
            {
                return false;
            }

            var slug = Regex.Match(sourceUri.AbsolutePath, @"^/draft/([a-z0-9]+(?:-[a-z0-9]+)*)/?$").Groups[1].Value;
            return Uri.TryCreate(mapUrl, UriKind.Absolute, out var mapUri) &&
                string.Equals(mapUri.Scheme, Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase) &&
                mapUri.IsDefaultPort &&
                Regex.IsMatch(mapUri.Host, @"^pub-[a-f0-9]{32}\.r2\.dev$") &&
                string.IsNullOrEmpty(mapUri.UserInfo) &&
                string.IsNullOrEmpty(mapUri.Query) &&
                string.IsNullOrEmpty(mapUri.Fragment) &&
                mapUri.AbsolutePath == $"/drafts/{slug}.png";
        }

        private static bool IsPng(byte[] image)
        {
            byte[] signature = { 137, 80, 78, 71, 13, 10, 26, 10 };
            if (image.Length < signature.Length)
            {
                return false;
            }

            for (var index = 0; index < signature.Length; index++)
            {
                if (image[index] != signature[index])
                {
                    return false;
                }
            }

            return true;
        }

        [HttpGet("{sessionId}")]
        public async Task<ActionResult<SessionDto>> GetSession(Guid sessionId)
        {
            var sessionFromDb = await this.repository.GetByIdWithEvents(sessionId);
            if (sessionFromDb == null)
            {
                return new NotFoundResult();
            }

            await this.repository.RememberSessionInList(this.HttpContext.Items["ListIdentifier"].ToString(), sessionFromDb);
            await this.repository.SaveChangesAsync();

            var sessionDto = new SessionDto(sessionFromDb);

            return sessionDto;
        }

        [HttpPost("{sessionId}/edit")]
        public async Task<ActionResult> ExchangePasswordForSecret([FromRoute] Guid sessionId, [FromBody] PasswordPayload pp)
        {
            var passwordCorrect = await this.authorization.CheckPassword(sessionId, pp.Password);
            if (!passwordCorrect)
            {
                return new UnauthorizedResult();
            }

            var token = await this.authorization.GenerateTokenFor(sessionId);
            return new OkObjectResult(new { secret = token.Value });
        }

        // TODO not cool, direct Events and stuff ??
        [HttpPost("{sessionId}/map")]
        public async Task<ActionResult> UploadMap(Guid sessionId)
        {
            var mapFile = this.HttpContext.Request.Form.Files["map"];

            if (mapFile.Length > 3000000)
            {
                return new BadRequestResult();
            }

            var sessionBlobContainer = new BlobContainerClient(this.configuration.GetConnectionString("BlobStorage"), sessionId.ToString());
            await sessionBlobContainer.CreateIfNotExistsAsync(PublicAccessType.Blob);

            var mapBlobClient = sessionBlobContainer.GetBlobClient("map");
            var blobHttpHeader = new BlobHttpHeaders();
            blobHttpHeader.ContentType = mapFile.ContentType;
            await mapBlobClient.UploadAsync(mapFile.OpenReadStream(), blobHttpHeader);

            var gameEvent = new GameEvent
            {
                Id = Guid.NewGuid(),
                SessionId = sessionId,
                HappenedAt = this.timeProvider.Now,
                EventType = GameEvent.MapAdded,
                SerializedPayload = mapBlobClient.Uri.ToString(),
            };
            await this.sessionContext.Events.AddAsync(gameEvent);
            await this.sessionContext.SaveChangesAsync();

            return new OkResult();
        }

        [HttpDelete("{sessionId}")]
        public async Task<ActionResult> DeleteSession([FromRoute] Guid sessionId)
        {
            var sessionExists = await this.repository.SessionExists(sessionId);

            if (!sessionExists)
            {
                return new NotFoundResult();
            }

            await this.repository.DeleteSession(sessionId);

            await this.repository.SaveChangesAsync();

            return new OkResult();
        }
    }
}
