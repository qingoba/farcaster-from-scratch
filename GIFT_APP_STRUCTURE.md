# Gift App Structure

## 项目概述
这是一个 Farcaster Mini App，用户可以发送和接收礼物，并获得相应的 NFT 纪念品。

## 文件结构

```
src/
├── types/
│   └── index.ts          # 类型定义
├── data/
│   └── mockData.ts       # 模拟数据和工具函数
├── context/
│   └── AppContext.tsx    # 全局状态管理
├── components/
│   ├── Header.tsx        # 顶部导航栏
│   ├── BottomNav.tsx     # 底部导航栏
│   ├── UserMenu.tsx      # 用户菜单弹窗
│   ├── GiftItem.tsx      # 礼物列表项组件
│   ├── ExploreTab.tsx    # 探索页面
│   ├── NewTab.tsx        # 发送礼物页面
│   └── MineTab.tsx       # 我的礼物页面
├── styles/
│   └── App.css           # 主要样式文件
└── App.tsx               # 主应用组件
```

## 功能特性

### 1. 探索页面 (Explore)
- Live/Historic 模式切换
- 按礼物价值降序展示
- 显示礼物标题、发送者、接收者、金额、描述
- 支持领取未被领取的礼物

### 2. 发送礼物页面 (New)
- 填写礼物标题、接收者、金额、描述
- 支持发送给 "everyone" 并设置限量
- 表单验证和提交

### 3. 我的礼物页面 (Mine)
- 三个子标签：可领取的、已接收的、已发送的
- 紧凑型礼物列表展示

### 4. 用户界面
- 响应式设计，适配手机屏幕
- 用户头像和菜单
- 钱包连接/断开功能

## 数据结构

### Gift 接口
```typescript
interface Gift {
  id: string;
  title: string;
  from: string;
  to: string | 'everyone';
  amount: string;
  description: string;
  limit?: number;
  claimed: number;
  isClaimed: boolean;
  nftImage: string;
  createdAt: number;
}
```

## 状态管理
使用 React Context API 管理全局状态，包括：
- 当前活跃的标签页
- 探索模式 (live/historic)
- 我的礼物子标签
- 用户信息
- 礼物数据

## 样式设计
- 移动端优先的响应式设计
- 卡片式礼物展示
- 现代化的 UI 组件
- 适配不同屏幕尺寸

## 下一步开发
1. 集成真实的合约数据
2. 实现钱包连接功能
3. 添加 NFT 图片获取逻辑
4. 实现礼物发送和领取的合约交互
5. 优化用户体验和动画效果
