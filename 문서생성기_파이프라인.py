from transformers import AutoTokenizer, AutoModel
from rank_bm25 import BM25Okapi
import faiss, json, os, re
{
  "doc_id": "reg_2024_34518",
  "source": "행정업무의 운영 및 혁신에 관한 규정",
  "section": "제4조(공문서의 종류)",
  "content": "공문서의 종류는 다음 각 호의 구분에 따른다...",
  "embedding_vector": [0.123, -0.045, ...],
  "metadata": {
    "category": "행정규정",
    "year": 2024,
    "type": "대통령령"
  }
}

# 1. 규정 문서 로드
text_files = [open(f, encoding='utf-8').read() for f in os.listdir("data/laws")]

# 2. 청킹
chunks = [re.split(r'제\d+조', txt) for txt in text_files]

# 3. 임베딩 생성
tokenizer = AutoTokenizer.from_pretrained("intfloat/e5-large-v2")
model = AutoModel.from_pretrained("intfloat/e5-large-v2")

def embed(text):
    tokens = tokenizer(text, return_tensors='pt', truncation=True, padding=True)
    emb = model(**tokens).last_hidden_state.mean(dim=1).detach().numpy()
    return emb

vectors = [embed(chunk) for chunk in chunks]

# 4. 인덱스 구축
index = faiss.IndexFlatL2(vectors[0].shape[1])
index.add(np.vstack(vectors))

# 5. 질의-응답 or 문서생성
query = "국가연구개발계획서 작성 기준"
q_emb = embed(query)
D, I = index.search(q_emb, 3)
context = [chunks[i] for i in I[0]]

# 6. 생성 단계
from transformers import pipeline
gen = pipeline("text-generation", model="skt/kogpt2-base-v2")
response = gen(f"다음 규정을 기반으로 계획서 요약문을 작성:\n{context}", max_new_tokens=300)
