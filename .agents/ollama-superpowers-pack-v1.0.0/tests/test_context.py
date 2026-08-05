from ollama_superpowers.context import EvidencePacket, pack_evidence
def test_priority():
    text,rejected=pack_evidence([EvidencePacket("low","x"*100,1),EvidencePacket("high","y"*100,99)],50)
    assert "high" in text
