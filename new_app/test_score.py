from dotenv import load_dotenv
from pathlib import Path
from openai import OpenAI
import os, base64

load_dotenv(Path('backend/.env'))
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

target_path = Path('images/new_test_target/bias_3.png')
target_b64 = base64.b64encode(target_path.read_bytes()).decode()

bias_label = 'occupational gender bias in nursing'

prompt = ('You are a judge for an educational game about AI bias: ' + bias_label + '. '
          'Image 1 is the TARGET showing what beating the bias looks like. '
          'Image 2 is the player generated image (same as target for this test). '
          'Score 0-100 on how well the player challenged the bias. '
          'Return ONLY JSON with keys score and feedback.')

resp = client.chat.completions.create(
    model='gpt-4o',
    messages=[{'role': 'user', 'content': [
        {'type': 'text', 'text': prompt},
        {'type': 'image_url', 'image_url': {'url': 'data:image/png;base64,' + target_b64}},
        {'type': 'image_url', 'image_url': {'url': 'data:image/png;base64,' + target_b64}},
    ]}],
    max_tokens=200
)
print(resp.choices[0].message.content)
