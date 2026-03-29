using Services;
using State;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//
// Read configuration from environment variables
//
var nodeIdEnv = Environment.GetEnvironmentVariable("NODE_ID");
int nodeId = string.IsNullOrWhiteSpace(nodeIdEnv) ? 1 : int.Parse(nodeIdEnv);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var peersEnv = Environment.GetEnvironmentVariable("PEERS");
var peerUrls = string.IsNullOrWhiteSpace(peersEnv)
    ? new List<string>()
    : peersEnv.Split(',', StringSplitOptions.RemoveEmptyEntries)
              .Select(p => p.Trim())
              .ToList();

//
// Register shared state
//
builder.Services.AddSingleton<PaxosState>();

//
// Register HttpClient
//
builder.Services.AddHttpClient<PeerCommunicationService>();

//
// Register services
//
builder.Services.AddSingleton(new ProposalNumberService(nodeId));

builder.Services.AddSingleton<PaxosLearnerService>(sp =>
{
    var state = sp.GetRequiredService<PaxosState>();
    return new PaxosLearnerService(state);
});

builder.Services.AddSingleton<PaxosAcceptorService>(sp =>
{
    var state = sp.GetRequiredService<PaxosState>();
    return new PaxosAcceptorService(state, nodeId);
});

builder.Services.AddSingleton<PaxosCoordinatorService>(sp =>
{
    var proposalNumberService = sp.GetRequiredService<ProposalNumberService>();
    var peerCommunicationService = sp.GetRequiredService<PeerCommunicationService>();
    var learnerService = sp.GetRequiredService<PaxosLearnerService>();
    var state = sp.GetRequiredService<PaxosState>();

    return new PaxosCoordinatorService(
        proposalNumberService,
        peerCommunicationService,
        learnerService,
        state,
        nodeId,
        peerUrls
    );
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
// }
    app.UseSwagger();
    app.UseSwaggerUI();

//app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();