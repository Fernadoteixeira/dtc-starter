from openai import OpenAI
client=OpenAI(base_url="http://localhost:11434/v1/",api_key="ollama")
response=client.chat.completions.create(
    model="gpt-oss:20b",
    messages=[{"role":"user","content":"Audit this plan and return the main risk."}],
)
print(response.choices[0].message.content)
