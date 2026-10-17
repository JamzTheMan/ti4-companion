using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/tidraft")]
    public class TidraftController : ControllerBase
    {
        private const int MaxPageLength = 2 * 1024 * 1024;

        private static readonly Regex PlayersPattern = new(
            @"players:\$R\[\d+\]=\[(?<players>.*?)\],slices:",
            RegexOptions.Compiled | RegexOptions.Singleline);

        private static readonly Regex SelectionsPattern = new(
            @"selections:\$R\[\d+\]=\[(?<selections>.*?)\],stagedSelections:",
            RegexOptions.Compiled | RegexOptions.Singleline);

        private static readonly Regex FactionGameSetsPattern = new(
            @"factionGameSets:\$R\[\d+\]=\[(?<sets>[^\]]*)\]",
            RegexOptions.Compiled);

        private static readonly Regex ObjectPattern = new(
            @"\$R\[\d+\]=\{(?<object>[^{}]*)\}",
            RegexOptions.Compiled);

        private static readonly Regex PlayerIdPattern = new(
            @"(?:^|,)id:(?<id>\d+)(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex PlayerNamePattern = new(
            @"(?:^|,)name:""(?<name>(?:\\.|[^""\\])*)""(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex SelectionTypePattern = new(
            @"(?:^|,)type:""(?<type>[^""]+)""(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex SelectionPlayerIdPattern = new(
            @"(?:^|,)playerId:(?<id>\d+)(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex FactionIdPattern = new(
            @"(?:^|,)factionId:""(?<factionId>(?:\\.|[^""\\])*)""(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex ColorPattern = new(
            @"(?:^|,)color:""(?<color>(?:\\.|[^""\\])*)""(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex SeatIndexPattern = new(
            @"(?:^|,)seatIdx:(?<seatIdx>-?\d+)(?:,|$)",
            RegexOptions.Compiled);

        private static readonly Regex StringPattern = new(
            @"""(?<value>(?:\\.|[^""\\])*)""",
            RegexOptions.Compiled);

        private static readonly Regex ImageUrlPattern = new(
            @"imageUrl:""(?<imageUrl>(?:\\.|[^""\\])*)""",
            RegexOptions.Compiled);

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

            var response = await this.httpClient.GetAsync($"https://tidraft.com/draft/{slug}");
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return this.NotFound();
            }

            if (!response.IsSuccessStatusCode)
            {
                return this.StatusCode(502);
            }

            var html = await response.Content.ReadAsStringAsync();
            if (html.Length > MaxPageLength)
            {
                return this.StatusCode(502);
            }

            var data = ParseDraftPage(html, slug);
            return data == null
                ? this.StatusCode(502)
                : this.Content(data, "application/json");
        }

        private static string ParseDraftPage(string html, string slug)
        {
            if (!html.Contains($"urlName:\"{slug}\""))
            {
                return null;
            }

            var playersMatch = PlayersPattern.Match(html);
            var selectionsMatch = SelectionsPattern.Match(html);
            var factionGameSetsMatch = FactionGameSetsPattern.Match(html);
            if (!playersMatch.Success ||
                !selectionsMatch.Success ||
                !factionGameSetsMatch.Success)
            {
                return null;
            }

            var players = new List<object>();
            foreach (Match match in ObjectPattern.Matches(playersMatch.Groups["players"].Value))
            {
                var playerObject = match.Groups["object"].Value;
                var idMatch = PlayerIdPattern.Match(playerObject);
                var nameMatch = PlayerNamePattern.Match(playerObject);
                if (!idMatch.Success ||
                    !int.TryParse(idMatch.Groups["id"].Value, out var playerId) ||
                    !nameMatch.Success)
                {
                    return null;
                }

                players.Add(new
                {
                    id = playerId,
                    name = JsonConvert.DeserializeObject<string>(
                        $"\"{nameMatch.Groups["name"].Value}\""),
                });
            }

            if (players.Count == 0)
            {
                return null;
            }

            var selections = new List<object>();
            foreach (Match match in ObjectPattern.Matches(selectionsMatch.Groups["selections"].Value))
            {
                var selectionObject = match.Groups["object"].Value;
                var typeMatch = SelectionTypePattern.Match(selectionObject);
                if (!typeMatch.Success ||
                    (typeMatch.Groups["type"].Value != "SELECT_FACTION" &&
                     typeMatch.Groups["type"].Value != "SELECT_PLAYER_COLOR" &&
                     typeMatch.Groups["type"].Value != "SELECT_SEAT"))
                {
                    continue;
                }

                var playerIdMatch = SelectionPlayerIdPattern.Match(selectionObject);
                if (!playerIdMatch.Success ||
                    !int.TryParse(playerIdMatch.Groups["id"].Value, out var playerId))
                {
                    return null;
                }

                var selection = new Dictionary<string, object>
                {
                    ["type"] = typeMatch.Groups["type"].Value,
                    ["playerId"] = playerId,
                };
                var factionIdMatch = FactionIdPattern.Match(selectionObject);
                if (factionIdMatch.Success)
                {
                    selection["factionId"] = JsonConvert.DeserializeObject<string>(
                        $"\"{factionIdMatch.Groups["factionId"].Value}\"");
                }

                var colorMatch = ColorPattern.Match(selectionObject);
                if (colorMatch.Success)
                {
                    selection["color"] = JsonConvert.DeserializeObject<string>(
                        $"\"{colorMatch.Groups["color"].Value}\"");
                }

                var seatIndexMatch = SeatIndexPattern.Match(selectionObject);
                if (seatIndexMatch.Success)
                {
                    if (!int.TryParse(
                        seatIndexMatch.Groups["seatIdx"].Value,
                        out var seatIndex))
                    {
                        return null;
                    }

                    selection["seatIdx"] = seatIndex;
                }

                selections.Add(selection);
            }

            var factionGameSets = StringPattern.Matches(
                factionGameSetsMatch.Groups["sets"].Value)
                .Select(match => JsonConvert.DeserializeObject<string>(
                    $"\"{match.Groups["value"].Value}\""))
                .ToArray();
            var imageUrlMatch = ImageUrlPattern.Match(html);
            var imageUrl = imageUrlMatch.Success
                ? JsonConvert.DeserializeObject<string>(
                    $"\"{imageUrlMatch.Groups["imageUrl"].Value}\"")
                : string.Empty;

            return JsonConvert.SerializeObject(new
            {
                players,
                selections,
                settings = new { factionGameSets },
                imageUrl,
            });
        }
    }
}
