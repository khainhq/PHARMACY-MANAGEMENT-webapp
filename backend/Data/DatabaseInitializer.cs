using Microsoft.EntityFrameworkCore;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(PharmacyDbContext db)
    {
        const int maxAttempts = 30;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                await db.Database.MigrateAsync();
                await DataSeeder.SeedAsync(db);
                return;
            }
            catch when (attempt < maxAttempts)
            {
                await Task.Delay(TimeSpan.FromSeconds(3));
            }
        }
    }
}
