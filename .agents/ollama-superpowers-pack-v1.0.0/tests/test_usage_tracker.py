"""Tests for the provider usage tracker (BB01-R1)."""
from __future__ import annotations
from ollama_superpowers.usage_tracker import UsageTracker, UsageBlocked


def test_budget_enforcement():
    """Tracker blocks when provider request limit is reached."""
    t = UsageTracker(task_id="test", max_provider_requests=3)
    for i in range(3):
        cid = t.begin_request(model="gpt-oss:20b", step=i + 1, purpose="test")
        t.end_request(
            call_id=cid, model="gpt-oss:20b", step=i + 1, purpose="test",
            started_at="2026-01-01T00:00:00Z", finished_at="2026-01-01T00:00:01Z",
            duration_ms=1000.0, success=True,
        )
    assert t.provider_request_count == 3
    try:
        t.begin_request(model="gpt-oss:20b", step=4, purpose="test")
        assert False, "Should have blocked"
    except UsageBlocked:
        pass
    assert t.is_blocked


def test_efficiency_report():
    """Efficiency report computes correct metrics."""
    t = UsageTracker(task_id="test", max_provider_requests=25)
    for i in range(5):
        is_cloud = i % 2 == 0
        model = "glm-5.2:cloud" if is_cloud else "gpt-oss:20b"
        cid = t.begin_request(model=model, step=i + 1, purpose="test")
        t.end_request(
            call_id=cid, model=model, step=i + 1, purpose="test",
            started_at="2026-01-01T00:00:00Z", finished_at="2026-01-01T00:00:01Z",
            duration_ms=500.0, success=True,
            input_estimate=100 * (i + 1), output_estimate=50 * (i + 1),
        )
    report = t.efficiency_report()
    assert report["provider_requests_total"] == 5
    assert report["cloud_requests"] == 3
    assert report["local_requests"] == 2
    assert report["within_budget"] is True
    assert report["completed_successfully"] == 5
    assert report["local_to_cloud_ratio"] == "2:3"