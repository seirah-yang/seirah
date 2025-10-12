# ---- 1. 최소 CNN으로 '눈→뇌' 단계적 특징 학습 보기 ----
import torch, torch.nn as nn, torch.nn.functional as F
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import matplotlib.pyplot as plt

# 1) 데이터: 손글씨 숫자(MNIST) = 의료영상의 '축약된' 예시
transform = transforms.Compose([transforms.ToTensor()])
train = datasets.MNIST(root="./data", train=True, download=True, transform=transform)
test  = datasets.MNIST(root="./data", train=False, download=True, transform=transform)

train_loader = DataLoader(train, batch_size=128, shuffle=True)
test_loader  = DataLoader(test,  batch_size=256, shuffle=False)

# 2) 모델: 간단 CNN (눈=Conv, 뇌=깊어지는 계층)
class TinyCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, kernel_size=3, padding=1)   # 가장자리/윤곽 감지 (저수준)
        self.conv2 = nn.Conv2d(8, 16, kernel_size=3, padding=1)  # 패턴 결합 (중간수준)
        self.head  = nn.Linear(16*7*7, 10)                       # 의미 분류 (고수준)
    def forward(self, x):
        x = F.relu(self.conv1(x))       # 28x28 → (엣지/라인 등)
        x = F.max_pool2d(x, 2)          # 14x14
        x = F.relu(self.conv2(x))       # 14x14 → (조합된 패턴)
        x = F.max_pool2d(x, 2)          # 7x7
        x = x.view(x.size(0), -1)
        return self.head(x)

device = "cuda" if torch.cuda.is_available() else "cpu"
model = TinyCNN().to(device)
opt = torch.optim.Adam(model.parameters(), lr=1e-3)
loss_fn = nn.CrossEntropyLoss()

# 3) 빠른 학습(1 epoch만): '눈→뇌' 흐름 시연 목적
for epoch in range(1):
    model.train()
    for xb, yb in train_loader:
        xb, yb = xb.to(device), yb.to(device)
        opt.zero_grad()
        pred = model(xb)
        loss = loss_fn(pred, yb)
        loss.backward()
        opt.step()

# 4) 첫 합성곱층 필터 시각화 = '눈의 필터'
with torch.no_grad():
    k = model.conv1.weight.cpu().clone()
fig, axes = plt.subplots(1, min(8, k.size(0)), figsize=(10,2))
for i, ax in enumerate(axes):
    ax.imshow(k[i,0].numpy(), cmap="gray")
    ax.axis("off")
fig.suptitle("Conv1 Filters = '눈'이 세상을 보는 방식(엣지/윤곽)")
plt.show()

# 5) 중간 특성맵 시각화 = '뇌의 중간표현'
xb, _ = next(iter(test_loader))
with torch.no_grad():
    a1 = F.relu(model.conv1(xb.to(device)))      # 저수준
    a1p = F.max_pool2d(a1, 2)
    a2 = F.relu(model.conv2(a1p))                # 중간수준
feat = a2[0].cpu()  # 첫 이미지의 특성맵 16개 중 일부 보기

fig, axes = plt.subplots(2, 8, figsize=(12,3))
for i, ax in enumerate(axes.flatten()):
    ax.imshow(feat[i].numpy(), cmap="gray")
    ax.axis("off")
fig.suptitle("중간 계층 특성맵 = '뇌'가 패턴을 조합해가는 모습")
plt.show()

# 6) 정확도
model.eval()
correct = 0
total = 0
with torch.no_grad():
    for xb, yb in test_loader:
        xb, yb = xb.to(device), yb.to(device)
        pred = model(xb).argmax(1)
        correct += (pred == yb).sum().item()
        total += yb.size(0)
print(f"Test accuracy ~ {correct/total:.3f}")
