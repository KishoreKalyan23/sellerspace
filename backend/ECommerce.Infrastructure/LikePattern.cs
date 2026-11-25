namespace ECommerce.Infrastructure;

internal static class LikePattern
{
    public const string EscapeCharacter = @"\";

    // Escapes LIKE/ILIKE wildcards so user input is matched literally; pair with EscapeCharacter in EF.Functions.ILike.
    public static string Escape(string value) =>
        value.Replace(EscapeCharacter, EscapeCharacter + EscapeCharacter)
            .Replace("%", EscapeCharacter + "%")
            .Replace("_", EscapeCharacter + "_");
}
