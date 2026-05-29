using TourismAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<DataService>();
builder.Services.AddSingleton<CacheService>();     // ← NOUVEAU
builder.Services.AddScoped<LlmService>();
builder.Services.AddScoped<RagService>();
builder.Services.AddScoped<GeoService>();
builder.Services.AddScoped<OrchestratorService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    );
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("🚀 Tourism API démarrée !");
Console.WriteLine("📖 Swagger : http://localhost:5014/swagger");

app.Run();