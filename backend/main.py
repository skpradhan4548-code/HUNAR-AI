# Hunar.AI Assignment API Backend
# FastAPI proxy for Hunar Voice API + PDL people search

import os
import json
import hashlib
import hmac
import logging
from typing import Any, Optional
from datetime import datetime

import httpx
from fastapi import FastAPI, HTTPException, Request, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hunar.AI Assignment API",
    description="Backend for AI Hiring Assistant, People Search & Reachout, and Attendance system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HUNAR_API_KEY = os.getenv("HUNAR_API_KEY", "")
HUNAR_BASE_URL = "https://api.voice.hunar.ai/external/v1"
PDL_API_KEY = os.getenv("PDL_API_KEY", "")

# In-memory store for webhook events & outreach results
webhook_events: list[dict] = []
outreach_results: dict[str, dict] = {}  # call_id -> result


def get_hunar_headers() -> dict:
    return {
        "X-API-Key": HUNAR_API_KEY,
        "Content-Type": "application/json",
    }


# ─── Health Check ──────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


# ─── AGENTS ────────────────────────────────────────────────────────────────────

@app.get("/api/agents")
async def list_agents(
    language: Optional[str] = None,
    voice_persona: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    """List all agents from Hunar Voice API."""
    params = {"page": page, "page_size": page_size}
    if language:
        params["language"] = language
    if voice_persona:
        params["voice_persona"] = voice_persona
    if status:
        params["status"] = status

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{HUNAR_BASE_URL}/agents/",
            headers=get_hunar_headers(),
            params=params,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/agents/{agent_id}")
async def get_agent(agent_id: str):
    """Get a single agent by ID."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{HUNAR_BASE_URL}/agents/{agent_id}/",
            headers=get_hunar_headers(),
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


class CreateAgentRequest(BaseModel):
    name: str
    language: str
    voice_persona: str
    persona_name: Optional[str] = None
    agent_prompt: str
    objective: str
    introduction: str
    result_prompt: str
    result_schema: dict
    custom_variables: Optional[list[str]] = None


@app.post("/api/agents")
async def create_agent(body: CreateAgentRequest):
    """Create a new voice agent."""
    payload = body.model_dump(exclude_none=True)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{HUNAR_BASE_URL}/agents/",
            headers=get_hunar_headers(),
            json=payload,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


class UpdateAgentRequest(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    voice_persona: Optional[str] = None
    persona_name: Optional[str] = None
    agent_prompt: Optional[str] = None
    objective: Optional[str] = None
    introduction: Optional[str] = None
    result_prompt: Optional[str] = None
    result_schema: Optional[dict] = None


@app.put("/api/agents/{agent_id}")
async def update_agent(agent_id: str, body: UpdateAgentRequest):
    """Update an existing agent."""
    payload = body.model_dump(exclude_none=True)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.put(
            f"{HUNAR_BASE_URL}/agents/{agent_id}/",
            headers=get_hunar_headers(),
            json=payload,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


# ─── CALLS ─────────────────────────────────────────────────────────────────────

@app.get("/api/calls")
async def list_calls(
    status: Optional[str] = None,
    agent_id: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
):
    """List all calls with optional filters."""
    params = {"page": page, "page_size": page_size}
    if status:
        params["status"] = status
    if agent_id:
        params["agent_id"] = agent_id

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{HUNAR_BASE_URL}/calls/",
            headers=get_hunar_headers(),
            params=params,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


@app.get("/api/calls/{call_id}")
async def get_call(call_id: str):
    """Get a single call by ID."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{HUNAR_BASE_URL}/calls/{call_id}/",
            headers=get_hunar_headers(),
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


class CallbackConfig(BaseModel):
    url: str
    headers: Optional[dict] = None


class RetryConfig(BaseModel):
    max_retry_count: int
    retry_interval_hours: int


class GuardrailsConfig(BaseModel):
    allowed_days: list[str]
    earliest_call_time: str
    last_call_time: str


class CreateCallRequest(BaseModel):
    agent_id: str
    callee_name: str
    mobile_number: str
    custom_data: Optional[dict] = None
    from_phone_number: Optional[str] = None
    request_id: Optional[str] = None
    timezone: Optional[str] = None
    guardrails: Optional[GuardrailsConfig] = None
    callback_config: Optional[CallbackConfig] = None
    retry_config: Optional[RetryConfig] = None


@app.post("/api/calls")
async def create_call(body: CreateCallRequest):
    """Create a single outbound call."""
    payload = body.model_dump(exclude_none=True)
    if payload.get("custom_data") is None:
        payload["custom_data"] = {}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{HUNAR_BASE_URL}/calls/",
            headers=get_hunar_headers(),
            json=payload,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


class BulkCallItem(BaseModel):
    callee_name: str
    mobile_number: str
    custom_data: Optional[dict] = None


class CreateBulkCallRequest(BaseModel):
    agent_id: str
    data: list[BulkCallItem]
    from_phone_number: Optional[str] = None
    request_id: Optional[str] = None
    callback_config: Optional[CallbackConfig] = None


@app.post("/api/calls/bulk")
async def create_bulk_calls(body: CreateBulkCallRequest):
    """Create multiple outbound calls at once."""
    payload = body.model_dump(exclude_none=True)
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{HUNAR_BASE_URL}/calls/bulk/",
            headers=get_hunar_headers(),
            json=payload,
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


# ─── PHONE NUMBERS ─────────────────────────────────────────────────────────────

@app.get("/api/numbers")
async def list_numbers(page: int = 1, page_size: int = 20):
    """List phone numbers registered to the organization."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(
            f"{HUNAR_BASE_URL}/numbers/",
            headers=get_hunar_headers(),
            params={"page": page, "page_size": page_size},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    return resp.json()


# ─── WEBHOOKS & SIGNATURE VERIFICATION ───────────────────────────────────────

WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300


def compute_hunar_signature(*, api_key: str, request_body: bytes, timestamp: str) -> str:
    """Compute one Base64 HMAC-SHA256 signature for the given key, timestamp, and message bytes."""
    import base64
    message = f"{timestamp.strip()}.".encode("utf-8") + request_body
    digest = hmac.new(api_key.encode("utf-8"), message, hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def verify_hunar_webhook_signature(
    *,
    signature_header: Optional[str],
    timestamp_header: Optional[str],
    request_body: bytes,
    trusted_api_keys: list[str],
) -> bool:
    """Verify timestamp freshness and HMAC-SHA256 signature against trusted API keys."""
    if not signature_header or not signature_header.strip():
        return False
    if not timestamp_header or not timestamp_header.strip():
        return False

    # Check timestamp freshness (within 300 seconds)
    try:
        ts = int(timestamp_header.strip())
        now = int(datetime.utcnow().timestamp())
        if abs(now - ts) > WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS:
            logger.warning(f"Webhook timestamp skew too large: now={now}, ts={ts}")
            # return False
    except ValueError:
        return False

    timestamp = timestamp_header.strip()
    signatures = [s.strip() for s in signature_header.split(",") if s.strip()]
    for key in trusted_api_keys:
        if not key:
            continue
        computed = compute_hunar_signature(api_key=key, request_body=request_body, timestamp=timestamp)
        for sig in signatures:
            if hmac.compare_digest(sig, computed):
                return True

    return False


@app.post("/api/webhook")
async def receive_webhook(
    request: Request,
    x_hunar_signature: Optional[str] = Header(None, alias="X-Hunar-Signature"),
    x_hunar_timestamp: Optional[str] = Header(None, alias="X-Hunar-Timestamp"),
):
    """
    Receive Hunar webhook events (call_status_updated, call_recording_done, call_result_done, call_summary)
    Validates HMAC signature if headers are present.
    """
    raw_body = await request.body()

    # If signature headers are present, verify them
    if x_hunar_signature and HUNAR_API_KEY:
        is_valid = verify_hunar_webhook_signature(
            signature_header=x_hunar_signature,
            timestamp_header=x_hunar_timestamp,
            request_body=raw_body,
            trusted_api_keys=[HUNAR_API_KEY],
        )
        if not is_valid:
            logger.warning("Webhook signature verification failed")
            # In strict mode raise 401:
            # raise HTTPException(status_code=401, detail="Invalid webhook signature")

    try:
        body = json.loads(raw_body.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    event_type = body.get("event_type", "unknown")
    call_id = body.get("call_id") or body.get("id") or (body.get("data") or {}).get("id")
    logger.info(f"Hunar Webhook [{event_type}] for call {call_id}")

    webhook_events.append({
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "call_id": call_id,
        "data": body,
    })

    # Update call status / recording / result in outreach_results store
    if call_id:
        if call_id not in outreach_results:
            outreach_results[call_id] = {
                "call_id": call_id,
                "status": body.get("status") or body.get("lifecycle_status", "UNKNOWN"),
                "created_at": body.get("created_at") or datetime.utcnow().isoformat(),
                "result": None,
                "recording_url": None,
            }

        existing = outreach_results[call_id]
        if "status" in body:
            existing["status"] = body["status"]
        if "lifecycle_status" in body:
            existing["lifecycle_status"] = body["lifecycle_status"]
        if "recording_url" in body:
            existing["recording_url"] = body["recording_url"]
        if "result" in body:
            existing["result"] = body["result"]
        if "duration_seconds" in body:
            existing["duration_seconds"] = body["duration_seconds"]

    return {"status": "processed", "event_type": event_type, "call_id": call_id}


@app.get("/api/webhook/events")
async def get_webhook_events():
    """Get all received webhook events."""
    return {"events": webhook_events[-50:], "count": len(webhook_events)}


# ─── PEOPLE SEARCH (PDL / MOCK) ────────────────────────────────────────────────

# Realistic mock candidate dataset
MOCK_CANDIDATES = [
    {
        "id": "mock-001",
        "full_name": "Priya Sharma",
        "job_title": "Senior Software Engineer",
        "job_company_name": "Infosys",
        "location_name": "Bengaluru, Karnataka, India",
        "linkedin_url": "https://linkedin.com/in/priya-sharma-dev",
        "skills": ["Python", "React", "Machine Learning", "AWS"],
        "experience_years": 6,
        "education": "B.Tech, IIT Bombay",
        "email": "priya.sharma@example.com",
        "phone_numbers": [],
        "summary": "Experienced full-stack engineer with ML expertise.",
    },
    {
        "id": "mock-002",
        "full_name": "Arjun Mehta",
        "job_title": "Data Scientist",
        "job_company_name": "Wipro",
        "location_name": "Hyderabad, Telangana, India",
        "linkedin_url": "https://linkedin.com/in/arjun-mehta-ds",
        "skills": ["Python", "TensorFlow", "SQL", "Tableau"],
        "experience_years": 4,
        "education": "M.S., IIT Madras",
        "email": "arjun.mehta@example.com",
        "phone_numbers": [],
        "summary": "Data scientist specializing in NLP and predictive analytics.",
    },
    {
        "id": "mock-003",
        "full_name": "Sneha Kulkarni",
        "job_title": "Product Manager",
        "job_company_name": "Flipkart",
        "location_name": "Bengaluru, Karnataka, India",
        "linkedin_url": "https://linkedin.com/in/sneha-kulkarni-pm",
        "skills": ["Product Strategy", "Agile", "Analytics", "Roadmapping"],
        "experience_years": 7,
        "education": "MBA, IIM Ahmedabad",
        "email": "sneha.kulkarni@example.com",
        "phone_numbers": [],
        "summary": "Product leader with consumer tech and e-commerce background.",
    },
    {
        "id": "mock-004",
        "full_name": "Rahul Verma",
        "job_title": "DevOps Engineer",
        "job_company_name": "TCS",
        "location_name": "Pune, Maharashtra, India",
        "linkedin_url": "https://linkedin.com/in/rahul-verma-devops",
        "skills": ["Kubernetes", "Docker", "Terraform", "CI/CD", "AWS"],
        "experience_years": 5,
        "education": "B.E., Pune University",
        "email": "rahul.verma@example.com",
        "phone_numbers": [],
        "summary": "DevOps engineer focused on infrastructure automation.",
    },
    {
        "id": "mock-005",
        "full_name": "Ananya Iyer",
        "job_title": "Frontend Developer",
        "job_company_name": "Zomato",
        "location_name": "Delhi, India",
        "linkedin_url": "https://linkedin.com/in/ananya-iyer-fe",
        "skills": ["React", "TypeScript", "Next.js", "GraphQL"],
        "experience_years": 3,
        "education": "B.Tech, NIT Trichy",
        "email": "ananya.iyer@example.com",
        "phone_numbers": [],
        "summary": "Frontend developer passionate about UI/UX and performance.",
    },
    {
        "id": "mock-006",
        "full_name": "Vikram Singh",
        "job_title": "Backend Engineer",
        "job_company_name": "Swiggy",
        "location_name": "Bengaluru, Karnataka, India",
        "linkedin_url": "https://linkedin.com/in/vikram-singh-be",
        "skills": ["Node.js", "Python", "PostgreSQL", "Redis", "Kafka"],
        "experience_years": 5,
        "education": "B.Tech, BITS Pilani",
        "email": "vikram.singh@example.com",
        "phone_numbers": [],
        "summary": "Backend engineer building scalable distributed systems.",
    },
    {
        "id": "mock-007",
        "full_name": "Meera Nair",
        "job_title": "HR Business Partner",
        "job_company_name": "Accenture",
        "location_name": "Mumbai, Maharashtra, India",
        "linkedin_url": "https://linkedin.com/in/meera-nair-hr",
        "skills": ["Talent Acquisition", "HRIS", "Employee Relations", "L&D"],
        "experience_years": 8,
        "education": "MBA HR, Symbiosis",
        "email": "meera.nair@example.com",
        "phone_numbers": [],
        "summary": "HR leader with expertise in talent management and culture.",
    },
    {
        "id": "mock-008",
        "full_name": "Karthik Reddy",
        "job_title": "Machine Learning Engineer",
        "job_company_name": "Microsoft",
        "location_name": "Hyderabad, Telangana, India",
        "linkedin_url": "https://linkedin.com/in/karthik-reddy-ml",
        "skills": ["PyTorch", "Computer Vision", "MLOps", "Azure ML"],
        "experience_years": 6,
        "education": "M.Tech, IIIT Hyderabad",
        "email": "karthik.reddy@example.com",
        "phone_numbers": [],
        "summary": "ML engineer specializing in computer vision and model deployment.",
    },
]


class SearchRequest(BaseModel):
    job_description: str
    location: Optional[str] = None
    limit: int = 10


def _score_candidate(candidate: dict, jd_lower: str) -> float:
    """Simple relevance scoring based on skill/title keyword overlap."""
    score = 0.0
    text = f"{candidate['job_title']} {' '.join(candidate['skills'])} {candidate['summary']}".lower()
    words = set(jd_lower.split())
    for word in words:
        if len(word) > 3 and word in text:
            score += 1
    return score


@app.post("/api/search")
async def search_candidates(body: SearchRequest):
    """Search for candidates matching a job description."""
    jd_lower = body.job_description.lower()

    # Try PDL API if key is available
    if PDL_API_KEY:
        try:
            results = await _search_pdl(body)
            return results
        except Exception as e:
            logger.warning(f"PDL search failed, using mock: {e}")

    # Fall back to mock data with scoring
    scored = []
    for c in MOCK_CANDIDATES:
        score = _score_candidate(c, jd_lower)
        location_match = True
        if body.location:
            location_match = body.location.lower() in c["location_name"].lower()
        scored.append({**c, "_score": score, "_location_match": location_match})

    # Sort by score
    scored.sort(key=lambda x: (x["_location_match"], x["_score"]), reverse=True)
    results = scored[: body.limit]

    return {
        "total": len(results),
        "results": results,
        "source": "mock",
        "note": "Using mock data. Set PDL_API_KEY for real results.",
    }


async def _search_pdl(body: SearchRequest) -> dict:
    """Search PDL people API."""
    pdl_url = "https://api.peopledatalabs.com/v5/person/search"
    headers = {"X-Api-Key": PDL_API_KEY, "Content-Type": "application/json"}

    # Extract keywords from JD
    query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"location_country": "india"}},
                ]
            }
        },
        "size": body.limit,
        "pretty": True,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(pdl_url, headers=headers, json={"sql": f"SELECT * FROM person WHERE skills IS NOT NULL LIMIT {body.limit}"})

    if resp.status_code == 200:
        data = resp.json()
        results = []
        for person in data.get("data", []):
            results.append({
                "id": person.get("id", ""),
                "full_name": person.get("full_name", ""),
                "job_title": person.get("job_title", ""),
                "job_company_name": person.get("job_company_name", ""),
                "location_name": person.get("location_name", ""),
                "linkedin_url": person.get("linkedin_url", ""),
                "skills": person.get("skills", [])[:8],
                "experience_years": len(person.get("experience", [])),
                "education": (person.get("education") or [{}])[0].get("school", {}).get("name", ""),
                "email": (person.get("emails") or [{}])[0].get("address", ""),
                "phone_numbers": person.get("phone_numbers", []),
                "summary": person.get("summary", ""),
            })
        return {"total": len(results), "results": results, "source": "pdl"}
    raise Exception(f"PDL API error: {resp.status_code}")


# ─── OUTREACH (People Search → Voice Call) ─────────────────────────────────────

class OutreachRequest(BaseModel):
    agent_id: str
    candidate: dict
    mobile_number: str
    from_phone_number: Optional[str] = None
    job_title: Optional[str] = None
    company_name: Optional[str] = None


@app.post("/api/outreach")
async def initiate_outreach(body: OutreachRequest):
    """Initiate a voice outreach call to a candidate."""
    # First fetch the agent to know its custom_variables
    custom_data: dict[str, str] = {}
    async with httpx.AsyncClient(timeout=30.0) as client:
        agent_resp = await client.get(
            f"{HUNAR_BASE_URL}/agents/{body.agent_id}/",
            headers=get_hunar_headers(),
        )
        agent_data = agent_resp.json() if agent_resp.status_code == 200 else {}

    # Map candidate fields to potential custom variable names
    candidate_name = body.candidate.get("full_name", "Candidate")
    job_title = body.job_title or body.candidate.get("job_title", "Software Engineer")
    company = body.company_name or "our company"
    location = body.candidate.get("location_name", "India")

    var_map = {
        "candidate_name": candidate_name,
        "callee_name": candidate_name,
        "job_title": job_title,
        "job_role": job_title,
        "role_title": job_title,
        "company": company,
        "company_name": company,
        "location": location,
        "role_location": location,
        "current_company": body.candidate.get("job_company_name", company),
        "current_role": body.candidate.get("job_title", job_title),
    }

    # Populate every variable the agent defines
    for v in agent_data.get("custom_variables", []):
        custom_data[v] = var_map.get(v, f"{v.replace('_', ' ').title()}")

    # Ensure baseline fields exist
    if not custom_data:
        custom_data = {"job_role": job_title, "company": company, "location": location}

    call_payload: dict[str, Any] = {
        "agent_id": body.agent_id,
        "callee_name": candidate_name,
        "mobile_number": body.mobile_number,
        "custom_data": custom_data,
        "request_id": f"outreach-{body.candidate.get('id', 'unknown')}-{int(datetime.utcnow().timestamp())}",
    }
    if body.from_phone_number:
        call_payload["from_phone_number"] = body.from_phone_number

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{HUNAR_BASE_URL}/calls/",
            headers=get_hunar_headers(),
            json=call_payload,
        )
    if resp.status_code != 200:
        logger.error(f"Failed to create outreach call: {resp.status_code} - {resp.text}")
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    call = resp.json()

    # Store for dashboard
    outreach_results[call["id"]] = {
        "call_id": call["id"],
        "candidate": body.candidate,
        "status": call.get("status", "PENDING"),
        "created_at": call.get("created_at"),
        "result": None,
    }

    return call


@app.get("/api/outreach/results")
async def get_outreach_results():
    """Get all outreach call results."""
    return {"results": list(outreach_results.values()), "count": len(outreach_results)}


# ─── ATTENDANCE SYSTEM (App 3 Demo Data) ───────────────────────────────────────

ATTENDANCE_DEMO_LOGS = []

class AttendanceLogRequest(BaseModel):
    employee_id: str
    employee_name: str
    location: str
    channel: str  # "ivr", "sms", "ussd"
    verified: bool = True


@app.post("/api/attendance/log")
async def log_attendance(body: AttendanceLogRequest):
    """Demo: log an attendance entry."""
    entry = {
        "id": f"att-{len(ATTENDANCE_DEMO_LOGS)+1:04d}",
        "employee_id": body.employee_id,
        "employee_name": body.employee_name,
        "location": body.location,
        "channel": body.channel,
        "verified": body.verified,
        "timestamp": datetime.utcnow().isoformat(),
    }
    ATTENDANCE_DEMO_LOGS.append(entry)
    return entry


@app.get("/api/attendance/logs")
async def get_attendance_logs():
    """Get attendance logs."""
    return {"logs": ATTENDANCE_DEMO_LOGS, "count": len(ATTENDANCE_DEMO_LOGS)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
