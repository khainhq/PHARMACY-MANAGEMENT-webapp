using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;

public sealed class ChatbotService : IChatbotService
{
    public async Task<IResult> ReplyAsync(JsonElement body, IWebHostEnvironment environment)
    {
        var message = body.TryGetProperty("message", out var messageProperty)
            ? messageProperty.GetString()?.Trim() ?? ""
            : "";

        if (string.IsNullOrWhiteSpace(message))
        {
            return Results.BadRequest(new { reply = "Bạn vui lòng nhập câu hỏi cần hỗ trợ." });
        }

        var guide = await ReadGuideAsync(environment);
        var reply = BuildOfflineChatbotReply(message, guide);
        return Results.Ok(new { reply });
    }

    private static async Task<string> ReadGuideAsync(IWebHostEnvironment environment)
    {
        var guidePath = Path.Combine(environment.ContentRootPath, "Docs", "ChatbotGuide.md");
        return File.Exists(guidePath) ? await File.ReadAllTextAsync(guidePath) : "";
    }

private static string BuildOfflineChatbotReply(string message, string guide)
{
    var normalized = NormalizeVietnameseSearchText(message);
    if (normalized.Contains("ban la ai") || normalized.Contains("chatbot") || normalized.Contains("tro ly"))
    {
        return "Tôi là Trợ lý PharmaCare, nhiệm vụ của tôi là hướng dẫn bạn sử dụng hệ thống quản lý nhà thuốc PharmaCare.";
    }

    if (normalized.Contains("dang nhap") || normalized.Contains("login") || normalized.Contains("sign in"))
    {
        return "Cách đăng nhập PharmaCare:\n\n1. Admin vào `/admin-login`.\n2. Nhân viên bán hàng hoặc quản lý sản phẩm vào `/login`.\n3. Tài khoản mẫu: `admin/admin123`, `sales/sales123`, `product/product123`.\n4. Nếu đăng nhập đúng nhưng không vào được, hãy kiểm tra backend Docker có đang chạy không.";
    }

    if (normalized.Contains("hoa don") || normalized.Contains("ban hang") || normalized.Contains("gio hang"))
    {
        return "Cách tạo hóa đơn:\n\n1. Đăng nhập bằng tài khoản bán hàng.\n2. Vào Hóa đơn > Tạo hóa đơn.\n3. Tìm thuốc, bấm Chọn và thêm vào giỏ hàng.\n4. Nhập thông tin khách hàng.\n5. Chọn phương thức thanh toán, trạng thái rồi tạo hóa đơn.";
    }

    if (normalized.Contains("thuoc") || normalized.Contains("san pham") || normalized.Contains("kho"))
    {
        return "Cách quản lý thuốc:\n\n1. Vào menu Thuốc.\n2. Bấm THÊM để thêm thuốc mới.\n3. Nhập tên thuốc, thành phần, số lượng, giá nhập, đơn giá và hạn sử dụng.\n4. Lưu lại để cập nhật danh sách thuốc.";
    }

    if (normalized.Contains("nhan vien") || normalized.Contains("tai khoan") || normalized.Contains("phan quyen"))
    {
        return "Chức năng nhân viên và tài khoản dành cho Admin:\n\n1. Vào Nhân viên để thêm, sửa, ngừng hoạt động nhân viên.\n2. Vào Tài khoản để tạo tài khoản đăng nhập.\n3. Gắn tài khoản với nhân viên và chọn vai trò Admin, Sales hoặc Product_manager.";
    }

    if (normalized.Contains("khach hang"))
    {
        return "Vào trang Khách hàng để thêm, sửa, xóa và tìm kiếm khách hàng. Khi tạo hóa đơn, hệ thống cũng có thể tự tạo khách hàng mới theo số điện thoại.";
    }

    if (normalized.Contains("nha cung cap") || normalized.Contains("phieu nhap") || normalized.Contains("nhap hang"))
    {
        return "Với nhà cung cấp và phiếu nhập:\n\n1. Vào Nhà cung cấp để quản lý thông tin nhà cung cấp.\n2. Vào Phiếu nhập > Tạo phiếu nhập.\n3. Chọn thuốc, số lượng, đơn giá nhập, nhân viên và nhà cung cấp.\n4. Khi lưu phiếu nhập thành công, tồn kho thuốc sẽ tăng lên.";
    }

    if (normalized.Contains("docker") || normalized.Contains("backend") || normalized.Contains("container") || normalized.Contains("localhost"))
    {
        return "Cách kiểm tra khi chạy Docker:\n\n1. Mở Docker Desktop.\n2. Chạy `docker compose up -d --build`.\n3. Mở frontend tại `http://localhost:3000`.\n4. Backend chạy tại `http://127.0.0.1:8000`.\n5. Nếu backend tắt, chạy `docker compose logs backend` để xem lỗi.";
    }

    var guideReply = BuildGuideSearchReply(message, guide);
    if (!string.IsNullOrWhiteSpace(guideReply))
    {
        return guideReply;
    }

    return "Chức năng của tôi là hướng dẫn sử dụng PharmaCare. Bạn có thể hỏi về đăng nhập, dashboard, thuốc, hóa đơn, khách hàng, nhân viên, nhà cung cấp, phiếu nhập, báo cáo hoặc tài khoản.";
}

private static string? BuildGuideSearchReply(string message, string guide)
{
    if (string.IsNullOrWhiteSpace(guide))
    {
        return null;
    }

    var queryTokens = NormalizeVietnameseSearchText(message)
        .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Where(token => token.Length >= 3)
        .Where(token => !IsChatbotStopWord(token))
        .Distinct()
        .ToArray();

    if (queryTokens.Length == 0)
    {
        return null;
    }

    var best = ExtractGuideSections(guide)
        .Select(section => new
        {
            Section = section,
            Score = queryTokens.Sum(token =>
                (section.NormalizedTitle.Contains(token) ? 3 : 0) +
                (section.NormalizedContent.Contains(token) ? 1 : 0))
        })
        .Where(result => result.Score >= 3)
        .OrderByDescending(result => result.Score)
        .ThenBy(result => result.Section.Order)
        .FirstOrDefault();

    if (best is null)
    {
        return null;
    }

    var lines = best.Section.Content
        .Split('\n', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
        .Select(CleanupGuideLine)
        .Where(line => !string.IsNullOrWhiteSpace(line))
        .Take(8)
        .ToArray();

    if (lines.Length == 0)
    {
        return null;
    }

    return $"Mình tìm thấy hướng dẫn phù hợp trong mục \"{best.Section.Title}\":\n\n{string.Join("\n", lines)}";
}

private static List<GuideSection> ExtractGuideSections(string guide)
{
    var sections = new List<GuideSection>();
    using var reader = new StringReader(guide);

    string? currentTitle = null;
    var currentContent = new StringBuilder();
    var order = 0;

    while (reader.ReadLine() is { } line)
    {
        if (line.StartsWith("## ", StringComparison.Ordinal))
        {
            AddCurrentSection();
            currentTitle = line[3..].Trim();
            currentContent.Clear();
            continue;
        }

        if (currentTitle is not null)
        {
            currentContent.AppendLine(line);
        }
    }

    AddCurrentSection();
    return sections;

    void AddCurrentSection()
    {
        if (string.IsNullOrWhiteSpace(currentTitle))
        {
            return;
        }

        var content = currentContent.ToString().Trim();
        if (string.IsNullOrWhiteSpace(content))
        {
            return;
        }

        sections.Add(new GuideSection(
            currentTitle,
            content,
            NormalizeVietnameseSearchText(currentTitle),
            NormalizeVietnameseSearchText(content),
            order++));
    }
}

private static string CleanupGuideLine(string line)
{
    var cleaned = line.Trim();
    cleaned = Regex.Replace(cleaned, @"^#{1,6}\s+", "");
    cleaned = Regex.Replace(cleaned, @"^[-*]\s+", "- ");
    cleaned = Regex.Replace(cleaned, @"^\d+\.\s+", match => match.Value);
    return cleaned;
}

private static bool IsChatbotStopWord(string token) =>
    token is "cach" or "lam" or "the" or "nao" or "giup" or "minh" or "toi" or "can" or "hoi" or "huong" or "dan" or "dung" or "chuc" or "nang" or "trong" or "tren" or "cho" or "voi" or "nay" or "kia";

private static string NormalizeVietnameseSearchText(string value)
{
    var normalized = value.ToLowerInvariant().Normalize(NormalizationForm.FormD);
    var builder = new StringBuilder(normalized.Length);

    foreach (var character in normalized)
    {
        var category = CharUnicodeInfo.GetUnicodeCategory(character);
        if (category != UnicodeCategory.NonSpacingMark)
        {
            builder.Append(character == '\u0111' ? 'd' : character);
        }
    }

    return builder.ToString().Normalize(NormalizationForm.FormC);
}
}
