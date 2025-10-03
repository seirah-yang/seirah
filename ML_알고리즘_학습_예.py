
# 알고리즘이 데이터를 "학습"하는 간단한 예시
# - 가상 환자 데이터 (혈압, 나이)
# - 타겟: 환자가 고혈압(1)인지 정상(0)인지 예측

import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 1. 데이터 생성 (혈압, 나이 → 환자 상태)
np.random.seed(42)
n = 200
age = np.random.randint(20, 80, n)
bp = np.random.randint(90, 180, n)

# 타겟: 혈압이 140 이상이거나 나이가 60 이상이면 '고혈압(1)'
y = ((bp > 140) | (age > 60)).astype(int)

X = np.column_stack([age, bp])

# 2. 데이터 분리
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 3. 모델 생성 및 학습
model = LogisticRegression()
model.fit(X_train, y_train)

# 4. 예측 및 평가
y_pred = model.predict(X_test)
print("정확도:", accuracy_score(y_test, y_pred))

# 5. 시각화 (나이 vs 혈압 분포)
plt.figure(figsize=(6, 5))
plt.scatter(X_test[:, 0], X_test[:, 1], c=y_pred, cmap="coolwarm", edgecolor="k")
plt.xlabel("나이")
plt.ylabel("혈압")
plt.title("Logistic Regression 분류 결과")
plt.colorbar(label="예측된 상태 (0=정상, 1=고혈압)")
plt.show()
