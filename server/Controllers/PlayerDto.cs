using Server.Domain;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Server.Controllers
{
    public class PlayerDto
    {
        public PlayerDto()
        {
            this.AtTable = -1;
        }

        public string PlayerName { get; set; }

        public string Faction { get; set; }

        public string Color { get; set; }

        public bool Speaker { get; set; }

        public int AtTable { get; set; }

        public int Initiative { get; set; }

        public static IEnumerable<PlayerDto> GetPlayers(SessionDto session)
        {
            var factionPicks = session.Draft?.Picks?.Where(p => p.Type == "faction") ?? new PickedPayload[0];
            var tablePicks = session.Draft?.Picks?.Where(p => p.Type == "tablePosition") ?? new PickedPayload[0];

            var picks = session.Factions.Select(faction =>
            {
                var decapitalizedFaction = faction;
                decapitalizedFaction = char.ToLower(decapitalizedFaction[0]) + decapitalizedFaction.Substring(1);
                var hasPlayerName = TryGetValueIgnoreCase(session.PlayerNames, faction, out var savedPlayerName);
                var playerName = hasPlayerName
                    ? savedPlayerName
                    : factionPicks.FirstOrDefault(fp => fp.Pick == faction)?.PlayerName;
                var tablePick = tablePicks.FirstOrDefault(tp => tp.PlayerName == playerName)?.Pick;
                var atTable = int.TryParse(tablePick, out var pickedPosition)
                    ? pickedPosition
                    : -1;
                var hasColor = TryGetValueIgnoreCase(session.Colors, faction, out var savedColor)
                    || TryGetValueIgnoreCase(session.Colors, decapitalizedFaction, out savedColor);

                return new PlayerDto
                {
                    Faction = faction,
                    PlayerName = playerName,
                    Color = hasColor ? savedColor : null,
                    Speaker = playerName != null && session.Draft?.Speaker == playerName,
                    AtTable = atTable,
                };
            });

            var speaker = session.Draft?.Speaker;

            if (!string.IsNullOrEmpty(speaker) && tablePicks.Any())
            {
                var ordered = tablePicks.OrderBy(tp => int.Parse(tp.Pick));
                var duplicated = ordered.Concat(ordered).ToList();
                var speakerIndex = duplicated.FindIndex(a => a.PlayerName == speaker);

                var inOrderAfterSpeaker = duplicated.Skip(speakerIndex).Take(picks.Count());

                return inOrderAfterSpeaker.Select(orderedPick => picks.First(pick => pick.PlayerName == orderedPick.PlayerName));
            }

            return picks;
        }

        private static bool TryGetValueIgnoreCase<T>(
            IDictionary<string, T> values,
            string key,
            out T value)
        {
            if (values != null)
            {
                foreach (var entry in values)
                {
                    if (string.Equals(entry.Key, key, StringComparison.OrdinalIgnoreCase))
                    {
                        value = entry.Value;
                        return true;
                    }
                }
            }

            value = default(T);
            return false;
        }
    }
}
