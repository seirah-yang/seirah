# PyTorch  (결정 경계의 시간 경과)
# - 데이터: sklearn make_moons (비선형 경계가 필요한 2D 데이터)
# - 모델: 2-32-32-1 MLP (ReLU)
# - 시각화: epoch 0 / 10 / 50 / 200 시점의 결정 경계, + 손실 곡선

import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.datasets import make_moons
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# 1) 데이터 준비 (2D → 분류)
X, y = make_moons(n_samples=1000, noise=0.2, random_state=42)
X = X.astype(np.float32)
y = y.astype(np.float32).reshape(-1, 1)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# Torch 텐서
X_train_t = torch.from_numpy(X_train)
y_train_t = torch.from_numpy(y_train)
X_test_t  = torch.from_numpy(X_test)
y_test_t  = torch.from_numpy(y_test)

# 2) 모델 정의: 2 -> 32 -> 32 -> 1
class MLP(nn.Module):
    def __init__(self):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(2, 32), nn.ReLU(),
            nn.Linear(32, 32), nn.ReLU(),
            nn.Linear(32, 1)   # 로짓 출력
        )
    def forward(self, x):
        return self.net(x)

model = MLP()

# 파라미터 개요 출력 (뉴런과 층의 느낌)
total_params = sum(p.numel() for p in model.parameters())
print(model)
print(f"총 파라미터 수: {total_params:,}")

# 3) 손실/최적화
criterion = nn.BCEWithLogitsLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-2)

# 4) 결정 경계 그리기 유틸
def plot_decision_boundary(model, X_np, y_np, title):
    model.eval()
    x_min, x_max = X_np[:,0].min()-0.5, X_np[:,0].max()+0.5
    y_min, y_max = X_np[:,1].min()-0.5, X_np[:,1].max()+0.5
    xx, yy = np.meshgrid(
        np.linspace(x_min, x_max, 300),
        np.linspace(y_min, y_max, 300)
    )
    grid = np.c_[xx.ravel(), yy.ravel()].astype(np.float32)
    with torch.no_grad():
        zz = torch.from_numpy(grid)
        logits = model(zz).numpy().reshape(xx.shape)
        probs = 1 / (1 + np.exp(-logits))  # 시그모이드
    plt.figure(figsize=(5,4))
    plt.contourf(xx, yy, probs, levels=25, alpha=0.6)   # 결정 경계 확률 맵
    plt.scatter(X_np[:,0], X_np[:,1], c=y_np.ravel(), edgecolors='k')
    plt.title(title)
    plt.xlabel("x1"); plt.ylabel("x2")
    plt.tight_layout()
    plt.show()

# 5) 학습 루프
epochs = 200
snapshots = {0: None, 10: None, 50: None, 200: None}
loss_hist = []

# Epoch 0 (초기 가중치) 스냅샷
plot_decision_boundary(model, X_train, y_train, "결정 경계 (epoch 0, 초기 가중치)")
snapshots[0] = True

for epoch in range(1, epochs+1):
    model.train()
    optimizer.zero_grad()
    logits = model(X_train_t)
    loss = criterion(logits, y_train_t)
    loss.backward()
    optimizer.step()

    loss_hist.append(loss.item())

    # 중간 스냅샷
    if epoch in snapshots:
        plot_decision_boundary(model, X_train, y_train, f"결정 경계 (epoch {epoch})")
        snapshots[epoch] = True

# 6) 손실 곡선
plt.figure(figsize=(5,3.5))
plt.plot(loss_hist)
plt.title("학습 손실(Train Loss) 추이")
plt.xlabel("Epoch"); plt.ylabel("BCEWithLogitsLoss")
plt.tight_layout()
plt.show()

# 7) 간단 평가 (정확도)
model.eval()
with torch.no_grad():
    preds_test = (torch.sigmoid(model(X_test_t)) > 0.5).float()
acc = (preds_test.eq(y_test_t).float().mean().item())
print(f"테스트 정확도: {acc:.3f}")
