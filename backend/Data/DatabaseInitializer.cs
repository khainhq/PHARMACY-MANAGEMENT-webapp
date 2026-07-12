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
                Console.WriteLine(
                    "Database ready. Seed counts: {0} medicines, {1} employees, {2} accounts, {3} invoices, {4} payments.",
                    await db.Medicines.CountAsync(),
                    await db.Employees.CountAsync(),
                    await db.Accounts.CountAsync(),
                    await db.Invoices.CountAsync(),
                    await db.Payments.CountAsync());
                return;
            }
            catch (Exception ex) when (attempt < maxAttempts)
            {
                Console.WriteLine("Database initialization attempt {0}/{1} failed: {2}", attempt, maxAttempts, ex.Message);
                await Task.Delay(TimeSpan.FromSeconds(3));
            }
        }
    }
}
