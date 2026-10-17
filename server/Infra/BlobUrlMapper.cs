namespace Server.Infra
{
    public static class BlobUrlMapper
    {
        public static string MapToPublic(string value, string publicBlobBaseUrl)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            if (!string.IsNullOrWhiteSpace(publicBlobBaseUrl))
            {
                return value.Replace("http://storage:10000", publicBlobBaseUrl.TrimEnd('/'));
            }

#if DEBUG
            return value.Replace("storage-emulator", "localhost");
#else
            return value;
#endif
        }
    }
}
